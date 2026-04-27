#!/usr/bin/env python3
"""
Script de prueba rápida para Pricing Service
Ejecuta verificaciones básicas sin dependencias externas
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Verificar que todos los módulos se importan correctamente"""
    try:
        from app.config import settings
        from app.domain.pricing import BookCondition, PricingDecision, PricingReference
        from app.application.pricing_use_cases import PricingService
        from app.infrastructure.database import Base
        from app.infrastructure.adapters.ebay_adapter import MockEbayAdapter
        print("✅ Todos los imports funcionan correctamente")
        return True
    except ImportError as e:
        print(f"❌ Error de import: {e}")
        return False

def test_config():
    """Verificar configuración"""
    try:
        from app.config import settings
        assert hasattr(settings, 'CONDITION_FACTORS')
        assert settings.CONDITION_FACTORS['NUEVO'] == 1.0
        assert settings.CONDITION_FACTORS['BUENO'] == 0.8
        assert settings.MIN_PRICE_THRESHOLD == 5.0
        print("✅ Configuración correcta")
        return True
    except Exception as e:
        print(f"❌ Error en configuración: {e}")
        return False

def test_domain_models():
    """Verificar modelos de dominio"""
    try:
        from app.domain.pricing import BookCondition, PricingDecision, PricingReference
        from datetime import datetime

        # Test enum
        assert BookCondition.NUEVO.value == "NUEVO"
        assert BookCondition.BUENO.value == "BUENO"

        # Test dataclasses
        ref = PricingReference(
            id=None,
            book_id="test",
            source="test",
            price=10.0,
            currency="USD",
            observed_at=datetime.utcnow(),
            metadata={}
        )
        assert ref.price == 10.0

        decision = PricingDecision(
            id=None,
            book_id="test",
            condition=BookCondition.NUEVO,
            base_price=15.0,
            condition_factor=1.0,
            suggested_price=15.0,
            references_used=1,
            source="external",
            explanation="Test",
            created_at=datetime.utcnow()
        )
        assert decision.suggested_price == 15.0

        print("✅ Modelos de dominio funcionan correctamente")
        return True
    except Exception as e:
        print(f"❌ Error en modelos de dominio: {e}")
        return False

def test_pricing_logic():
    """Verificar lógica de cálculo de precios"""
    try:
        from app.application.pricing_use_cases import PricingService
        from app.domain.pricing import BookCondition

        service = PricingService(use_mock=True)

        # Test cálculo de precio base
        references = [
            type('MockRef', (), {'price': 10.0})(),
            type('MockRef', (), {'price': 12.0})(),
            type('MockRef', (), {'price': 14.0})()
        ]
        base_price = service._calculate_base_price(references)
        assert 10.0 <= base_price <= 14.0  # Debe ser mediana

        # Test factores de condición
        assert service._PricingService__class__.CONDITION_FACTORS['NUEVO'] == 1.0
        assert service._PricingService__class__.CONDITION_FACTORS['BUENO'] == 0.8

        print("✅ Lógica de pricing funciona correctamente")
        return True
    except Exception as e:
        print(f"❌ Error en lógica de pricing: {e}")
        return False

def test_fallback():
    """Verificar lógica de fallback"""
    try:
        from app.application.pricing_use_cases import PricingService

        service = PricingService(use_mock=True)

        # Test fallback pricing
        fallback_price = service._fallback_base_price("A very long book title that should give higher price")
        assert fallback_price > 8.0
        assert fallback_price < 25.0

        print("✅ Lógica de fallback funciona correctamente")
        return True
    except Exception as e:
        print(f"❌ Error en fallback: {e}")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("🚀 Iniciando pruebas del Pricing Service...\n")

    tests = [
        ("Imports", test_imports),
        ("Configuración", test_config),
        ("Modelos de Dominio", test_domain_models),
        ("Lógica de Pricing", test_pricing_logic),
        ("Fallback", test_fallback)
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"🔍 Probando {test_name}...")
        if test_func():
            passed += 1
        print()

    print(f"📊 Resultados: {passed}/{total} pruebas pasaron")

    if passed == total:
        print("🎉 ¡Todas las pruebas pasaron! El código está funcional.")
        print("\n📝 Próximos pasos:")
        print("1. Instalar Docker y ejecutar: docker-compose up pricing-service")
        print("2. Probar endpoints con Postman usando la colección incluida")
        print("3. Ejecutar tests completos: python -m pytest tests/")
        return 0
    else:
        print("⚠️  Algunas pruebas fallaron. Revisa los errores arriba.")
        return 1

if __name__ == "__main__":
    sys.exit(main())