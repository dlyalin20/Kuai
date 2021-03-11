# Generated by Django 3.0.8 on 2021-03-11 00:49

import django.core.validators
from django.db import migrations, models
import jsonfield.fields


class Migration(migrations.Migration):

    dependencies = [
        ('Landing', '0003_profile'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='history',
            field=jsonfield.fields.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='profile_pic',
            field=models.BinaryField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='favorite_businesses',
            field=jsonfield.fields.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='latitude',
            field=models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(-90), django.core.validators.MaxValueValidator(90)]),
        ),
        migrations.AlterField(
            model_name='profile',
            name='longitude',
            field=models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(-180), django.core.validators.MaxValueValidator(180)]),
        ),
    ]
