# Generated by Django 3.1.6 on 2021-05-25 19:32

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Landing', '0004_auto_20210525_1524'),
    ]

    operations = [
        migrations.AlterField(
            model_name='waittimes',
            name='average',
            field=models.FloatField(default=0, validators=[django.core.validators.MinValueValidator(0)]),
        ),
        migrations.AlterField(
            model_name='waittimes',
            name='averagePeople',
            field=models.FloatField(default=0, validators=[django.core.validators.MinValueValidator(0)]),
        ),
    ]
