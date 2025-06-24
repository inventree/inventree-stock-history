"""Django config for the StockHistory plugin."""

from django.apps import AppConfig


class StockHistoryConfig(AppConfig):
    """Config class for the StockHistory plugin."""

    name = "stock_history"

    def ready(self):
        """This function is called whenever the StockHistory plugin is loaded."""
        ...
