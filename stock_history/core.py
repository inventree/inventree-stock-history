"""Record historical stock levels"""

from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _

from plugin import InvenTreePlugin

from plugin.mixins import (
    AppMixin,
    EventMixin,
    ScheduleMixin,
    SettingsMixin,
    UrlsMixin,
    UserInterfaceMixin,
)

from . import PLUGIN_VERSION


class StockHistory(
    AppMixin,
    EventMixin,
    ScheduleMixin,
    SettingsMixin,
    UrlsMixin,
    UserInterfaceMixin,
    InvenTreePlugin,
):
    """StockHistory - custom InvenTree plugin."""

    # Plugin metadata
    TITLE = "Stock History"
    NAME = "StockHistory"
    SLUG = "stock-history"
    DESCRIPTION = "Record historical stock levels"
    VERSION = PLUGIN_VERSION

    # Additional project information
    AUTHOR = "Oliver Walters"
    WEBSITE = "https://github.com/inventree/inventree-stock-history"
    LICENSE = "MIT"

    # Optionally specify supported InvenTree versions
    MIN_VERSION = "0.18.0"

    # Scheduled tasks (from ScheduleMixin)
    # Ref: https://docs.inventree.org/en/latest/plugins/mixins/schedule/
    SCHEDULED_TASKS = {
        # Define your scheduled tasks here...
    }

    # Plugin settings (from SettingsMixin)
    # Ref: https://docs.inventree.org/en/latest/plugins/mixins/settings/
    SETTINGS = {
        "USER_GROUP": {
            "name": _("Allowed Group"),
            "description": _("The user group that is allowed to view stock history"),
            "model": "auth.group",
        },
        "EXCLUDE_EXTERNAL_LOCATIONS": {
            "name": _("Exclude External Locations"),
            "description": _(
                "Exclude stock items in external locations from stocktake calculations"
            ),
            "validator": bool,
            "default": True,
        },
        "STOCK_COUNT_PERIOD": {
            "name": _("Stock Count Period"),
            "description": _("How often to record stock history levels"),
            "validator": [int, MinValueValidator(1)],
            "default": 7,
            "units": _("days"),
        },
        "IGNORE_INACTIVE_PARTS": {
            "name": _("Ignore Inactive Parts"),
            "description": _(
                "Ignore stock history for parts that are marked as inactive"
            ),
            "validator": bool,
            "default": True,
        },
        "STOCK_DELETE_PERIOD": {
            "name": _("Stock Delete Period"),
            "description": _("How long to keep stock history records before deletion"),
            "validator": [int, MinValueValidator(1)],
            "default": 365,
            "units": _("days"),
        },
    }

    # Respond to InvenTree events (from EventMixin)
    # Ref: https://docs.inventree.org/en/latest/plugins/mixins/event/
    def wants_process_event(self, event: str) -> bool:
        """Return True if the plugin wants to process the given event."""
        # Example: only process the 'create part' event
        return event == "part_part.created"

    def process_event(self, event: str, *args, **kwargs) -> None:
        """Process the provided event."""
        print("Processing custom event:", event)
        print("Arguments:", args)
        print("Keyword arguments:", kwargs)

    # Custom URL endpoints (from UrlsMixin)
    # Ref: https://docs.inventree.org/en/latest/plugins/mixins/urls/
    def setup_urls(self):
        """Configure custom URL endpoints for this plugin."""
        from django.urls import path
        from .views import StockHistoryList

        return [
            # Provide path to a simple custom view - replace this with your own views
            path("history/", StockHistoryList.as_view(), name="stock-history-list"),
        ]

    # User interface elements (from UserInterfaceMixin)
    # Ref: https://docs.inventree.org/en/latest/plugins/mixins/ui/

    # Custom UI panels
    def get_ui_panels(self, request, context: dict, **kwargs):
        """Return a list of custom panels to be rendered in the InvenTree user interface."""

        panels = []

        # Only display this panel for the 'part' target
        if context.get("target_model") == "part":
            panels.append({
                "key": "stock-history",
                "title": _("Stock History"),
                "description": _("Stock history"),
                "icon": "ti:chart-line:outline",
                "source": self.plugin_static_file(
                    "StockHistoryPanel.js:renderStockHistoryPanel"
                ),
                "context": {
                    # Provide additional context data to the panel
                    "settings": self.get_settings_dict(),
                },
            })

        return panels
