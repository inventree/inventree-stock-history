"""Admin site configuration for the StockHistory plugin."""

from django.contrib import admin

from .models import StockHistoryEntry


@admin.register(StockHistoryEntry)
class StockHistoryEntryAdmin(admin.ModelAdmin):
    """Admin interface for the StockHistoryEntry model."""

    autocomplete_fields = [
        "part",
    ]

    list_display = (
        "part",
        "date",
        "quantity",
        "cost_min",
        "cost_max",
    )
