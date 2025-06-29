# Generated by Django 4.2.22 on 2025-06-24 13:02

from django.db import migrations, connection
from django.db.utils import ProgrammingError


def collect_stock_history(apps, schema_editor):
    """Collect stock history information which is already in the database.

    Before this was a standalone plugin, stock history data was stored in
    'part_partstock
    """

    StockHistoryEntry = apps.get_model("stock_history", "stockhistoryentry")

    table = "part_partstocktake"

    fields = [
        "part_id",
        "item_count",
        "quantity",
        "date",
        "cost_min",
        "cost_min_currency",
        "cost_max",
        "cost_max_currency",
    ]

    conditions = ["item_count > 0", "quantity > 0"]

    query = f"SELECT {', '.join(fields)} FROM {table} WHERE {' AND '.join(conditions)};"

    try:
        cursor = connection.cursor()
        cursor.execute(query)
        results = cursor.fetchall()
    except ProgrammingError:
        print("Could not extract existing data for creating StockHistoryEntry items...")
        return

    # History entries to create
    entries = []

    for row in results:
        (
            part_id,
            item_count,
            quantity,
            date,
            cost_min,
            cost_min_currency,
            cost_max,
            cost_max_currency,
        ) = row

        entries.append(
            StockHistoryEntry(
                part_id=part_id,
                item_count=item_count,
                quantity=quantity,
                date=date,
                cost_min=cost_min,
                cost_min_currency=cost_min_currency,
                cost_max=cost_max,
                cost_max_currency=cost_max_currency,
            )
        )

    if len(entries) > 0:
        print(f"Creating {len(entries)} StockHistoryEntry items...")
        StockHistoryEntry.objects.bulk_create(entries)
        print("StockHistoryEntry items created successfully!")


def delete_entries(apps, schema_editor):
    """Reverse migration code.

    Remove any StockHistoryEntry objects from the database.
    """

    StockHistoryEntry = apps.get_model("stock_history", "stockhistoryentry")

    n = StockHistoryEntry.objects.count()

    if n > 0:
        queryset = StockHistoryEntry.objects.all()
        queryset._raw_delete(queryset.db)
        print(f"Deleted {n} StockHistoryEntry objects")


class Migration(migrations.Migration):
    dependencies = [
        ("stock_history", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(collect_stock_history, reverse_code=delete_entries)
    ]
