"""API views for the StockHistory plugin."""

from django.utils.translation import gettext_lazy as _

from django_filters import rest_framework as rest_filters

from rest_framework import permissions

from InvenTree.filters import ORDER_FILTER
from InvenTree.mixins import ListAPI

from .models import StockHistoryEntry
from .serializers import StockHistoryEntrySerializer


class StockHistoryFilter(rest_filters.FilterSet):
    """API filterset class for the StockHistory list API."""

    class Meta:
        """Metaclass options."""

        model = StockHistoryEntry
        fields = ["part"]

    # Filter by date range
    date_before = rest_filters.DateFilter(
        field_name="date", lookup_expr="lt", label=_("Date Before")
    )
    date_after = rest_filters.DateFilter(
        field_name="date", lookup_expr="gt", label=_("Date After")
    )


class StockHistoryList(ListAPI):
    """Example API view for the StockHistory plugin.

    This view returns some very simple example data,
    but the concept can be extended to include more complex logic.
    """

    # TODO: Custom permission check
    permission_classes = [permissions.IsAuthenticated]

    queryset = StockHistoryEntry.objects.all()
    serializer_class = StockHistoryEntrySerializer
    filterset_class = StockHistoryFilter

    # TODO: Filtering by field
    filter_backends = ORDER_FILTER
    ordering_fields = ["date", "quantity"]
    ordering = ["date"]
