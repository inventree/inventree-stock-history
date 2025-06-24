"""API serializers for the StockHistory plugin."""

from rest_framework import serializers

import InvenTree.serializers

from .models import StockHistoryEntry


class StockHistoryEntrySerializer(InvenTree.serializers.InvenTreeModelSerializer):
    """Example serializer for the StockHistory plugin.

    This simply demonstrates how to create a serializer,
    with a few example fields of different types.
    """

    class Meta:
        """Meta options for this serializer."""

        model = StockHistoryEntry

        fields = [
            "pk",
            "part",
            "date",
            "item_count",
            "quantity",
            "cost_min",
            "cost_min_currency",
            "cost_max",
            "cost_max_currency",
        ]

    quantity = serializers.FloatField()

    cost_min = InvenTree.serializers.InvenTreeMoneySerializer(allow_null=True)
    cost_min_currency = InvenTree.serializers.InvenTreeCurrencySerializer()

    cost_max = InvenTree.serializers.InvenTreeMoneySerializer(allow_null=True)
    cost_max_currency = InvenTree.serializers.InvenTreeCurrencySerializer()
