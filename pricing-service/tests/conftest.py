import pytest
from unittest.mock import MagicMock
from datetime import datetime

from app.domain.entities.pricing import PricingDecision, PriceReference, BookCondition


@pytest.fixture
def mock_repo():
    repo = MagicMock()
    repo.save_reference.side_effect = lambda ref: ref
    repo.save_decision.side_effect = lambda dec: dec
    repo.get_latest_decision.return_value = None
    repo.get_decision_history.return_value = []
    return repo
