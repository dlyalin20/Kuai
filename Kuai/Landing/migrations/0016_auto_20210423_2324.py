# Generated by Django 3.0.8 on 2021-04-23 23:24

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Landing', '0015_auto_20210423_2323'),
    ]

    operations = [
        migrations.AlterField(
            model_name='waitdata',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2021, 4, 23, 23, 24, 51, 186825)),
        ),
    ]