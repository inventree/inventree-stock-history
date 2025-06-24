"""Model definitions for the StockHistory plugin."""

from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

import InvenTree.fields
import part.models as part_models


class StockHistoryEntry(models.Model):
    """Model representing a historical stock entry for a particular Part.

    This is a representative count of available stock:
    - Performed on a given date
    - Records quantity of part in stock (across multiple stock items)
    - Records estimated value of "stock on hand"
    - Records user information
    """

    class Meta:
        """Meta options for the model."""

        app_label = "stock_history"
        verbose_name = _("Stock History Entry")
        verbose_name_plural = _("Stock History Entries")

    part = models.ForeignKey(
        part_models.Part,
        on_delete=models.CASCADE,
        related_name="stock_history_entries",
        verbose_name=_("Part"),
    )

    item_count = models.IntegerField(
        default=1,
        verbose_name=_("Item Count"),
        help_text=_("Number of individual stock items"),
    )

    quantity = models.DecimalField(
        max_digits=19,
        decimal_places=5,
        validators=[MinValueValidator(0)],
        verbose_name=_("Quantity"),
        help_text=_("Total available stock quantity"),
    )

    date = models.DateField(
        verbose_name=_("Date"),
        help_text=_("Date of stock count"),
        auto_now_add=True,
    )

    cost_min = InvenTree.fields.InvenTreeModelMoneyField(
        null=True,
        blank=True,
        verbose_name=_("Minimum Stock Cost"),
        help_text=_("Estimated minimum cost of stock on hand"),
    )

    cost_max = InvenTree.fields.InvenTreeModelMoneyField(
        null=True,
        blank=True,
        verbose_name=_("Maximum Stock Cost"),
        help_text=_("Estimated maximum cost of stock on hand"),
    )
