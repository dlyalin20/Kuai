# Generated by Django 3.0.8 on 2021-04-23 23:28

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Landing', '0016_auto_20210423_2324'),
    ]

    operations = [
        migrations.AlterField(
            model_name='waitdata',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2021, 4, 23, 23, 28, 25, 980259)),
        ),
    ]
