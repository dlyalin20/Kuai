# Generated by Django 3.0.8 on 2021-04-25 17:10

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('Landing', '0017_auto_20210423_2328'),
    ]

    operations = [
        migrations.RenameField(
            model_name='temp_business',
            old_name='xcor',
            new_name='lat',
        ),
        migrations.RenameField(
            model_name='temp_business',
            old_name='ycor',
            new_name='lon',
        ),
        migrations.RemoveField(
            model_name='temp_business',
            name='name',
        ),
        migrations.AddField(
            model_name='business',
            name='placeID',
            field=models.TextField(default=False, unique=True),
        ),
        migrations.AddField(
            model_name='temp_business',
            name='placeID',
            field=models.TextField(default=False, unique=True),
        ),
        migrations.AlterField(
            model_name='waitdata',
            name='timestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
