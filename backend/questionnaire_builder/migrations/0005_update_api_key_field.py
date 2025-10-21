# Generated manually to fix api_key field length issue

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questionnaire_builder', '0004_aiengineconfiguration'),
    ]

    operations = [
        migrations.AlterField(
            model_name='aiengineconfiguration',
            name='api_key',
            field=models.TextField(db_column='api_key'),
        ),
    ]
