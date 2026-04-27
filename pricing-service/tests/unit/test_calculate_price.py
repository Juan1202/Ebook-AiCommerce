import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from app.application.use_cases.calculate_price import CalculatePriceUseCase
from app.domain.entities.pricing import BookCondition, PriceReference
from app.infrastructure.adapters.ebay_adapter import EbayPriceResult


def _make_ebay_result(price: float) -> EbayPriceResult:
    return EbayPriceResult(
        price=price, currency="USD", title="Test Book", confidence_score=0.8
    )


@pytest.mark.asyncio
async def test_calculate_price_new_book_with_references(mock_repo):
    """Book with eBay references — price is average * condition_factor."""
    ebay_results = [_make_ebay_result(20.0), _make_ebay_result(22.0), _make_ebay_result(18.0)]
    with patch(
        "app.application.use_cases.calculate_price.ebay_adapter.search_prices",
        new=AsyncMock(return_value=ebay_results),
    ):
        use_case = CalculatePriceUseCase(mock_repo)
        result = await use_case.execute(
            book_id="book-1",
            isbn="9780141439518",
            title="Great Expectations",
            condition=BookCondition.NUEVO,
            publication_year=2024,
        )

    assert result["source"] == "ebay"
    assert result["is_fallback"] is False
    assert result["condition_factor"] == 1.0
    assert result["references_found"] == 3
    # avg = 20.0, factor = 1.0 → 20.0
    assert result["suggested_price"] == pytest.approx(20.0, abs=0.01)


@pytest.mark.asyncio
async def test_calculate_price_used_book_condition_factor_applied(mock_repo):
    """BUENO condition applies 0.75 factor to base price."""
    ebay_results = [_make_ebay_result(40.0)]
    with patch(
        "app.application.use_cases.calculate_price.ebay_adapter.search_prices",
        new=AsyncMock(return_value=ebay_results),
    ):
        use_case = CalculatePriceUseCase(mock_repo)
        result = await use_case.execute(
            book_id="book-2",
            isbn=None,
            title="Some Book",
            condition=BookCondition.BUENO,
            publication_year=2020,
        )

    assert result["condition_factor"] == 0.75
    # 40.0 * 0.75 = 30.0
    assert result["suggested_price"] == pytest.approx(30.0, abs=0.01)


@pytest.mark.asyncio
async def test_fallback_when_ebay_unavailable(mock_repo):
    """When eBay returns no results, internal rules provide price."""
    with patch(
        "app.application.use_cases.calculate_price.ebay_adapter.search_prices",
        new=AsyncMock(return_value=[]),
    ):
        use_case = CalculatePriceUseCase(mock_repo)
        result = await use_case.execute(
            book_id="book-3",
            isbn="9780000000000",
            title="Rare Book",
            condition=BookCondition.ACEPTABLE,
            publication_year=2010,
        )

    assert result["is_fallback"] is True
    assert result["source"] == "internal_rules"
    assert result["suggested_price"] >= 1.0  # never below minimum


@pytest.mark.asyncio
async def test_minimum_price_never_below_threshold(mock_repo):
    """DETERIORADO condition on a cheap book must not go below $1.00."""
    ebay_results = [_make_ebay_result(2.0)]  # 2.0 * 0.25 = 0.50 → floor at 1.0
    with patch(
        "app.application.use_cases.calculate_price.ebay_adapter.search_prices",
        new=AsyncMock(return_value=ebay_results),
    ):
        use_case = CalculatePriceUseCase(mock_repo)
        result = await use_case.execute(
            book_id="book-4",
            isbn=None,
            title="Old Book",
            condition=BookCondition.DETERIORADO,
            publication_year=2000,
        )

    assert result["suggested_price"] >= 1.0


@pytest.mark.asyncio
async def test_explanation_text_generated_correctly(mock_repo):
    """Explanation must mention reference count, condition, and final price."""
    ebay_results = [_make_ebay_result(12.50), _make_ebay_result(12.50), _make_ebay_result(12.50)]
    with patch(
        "app.application.use_cases.calculate_price.ebay_adapter.search_prices",
        new=AsyncMock(return_value=ebay_results),
    ):
        use_case = CalculatePriceUseCase(mock_repo)
        result = await use_case.execute(
            book_id="book-5",
            isbn="9780306406157",
            title="Classic Book",
            condition=BookCondition.BUENO,
            publication_year=2022,
        )

    explanation = result["explanation"]
    assert "3" in explanation  # reference count
    assert "BUENO" in explanation
    assert "0.75" in explanation
    assert "$" in explanation


@pytest.mark.asyncio
async def test_pricing_decision_persisted_with_full_traceability(mock_repo):
    """save_decision must be called with a full PricingDecision object."""
    with patch(
        "app.application.use_cases.calculate_price.ebay_adapter.search_prices",
        new=AsyncMock(return_value=[]),
    ):
        use_case = CalculatePriceUseCase(mock_repo)
        await use_case.execute(
            book_id="book-6",
            isbn=None,
            title="Book",
            condition=BookCondition.NUEVO,
            publication_year=2020,
        )

    mock_repo.save_decision.assert_called_once()
    saved = mock_repo.save_decision.call_args[0][0]
    assert saved.explanation != ""
    assert saved.condition_factor == 1.0
    assert saved.book_reference == "book-6"


@pytest.mark.asyncio
async def test_condition_factor_deteriorado_applies_correctly(mock_repo):
    """DETERIORADO condition applies 0.25 factor."""
    ebay_results = [_make_ebay_result(100.0)]
    with patch(
        "app.application.use_cases.calculate_price.ebay_adapter.search_prices",
        new=AsyncMock(return_value=ebay_results),
    ):
        use_case = CalculatePriceUseCase(mock_repo)
        result = await use_case.execute(
            book_id="book-7",
            isbn="9780000000001",
            title="Worn Book",
            condition=BookCondition.DETERIORADO,
            publication_year=2015,
        )

    assert result["condition_factor"] == 0.25
    # 100 * 0.25 = 25.0
    assert result["suggested_price"] == pytest.approx(25.0, abs=0.01)
