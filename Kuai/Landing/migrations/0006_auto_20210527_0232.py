# Generated by Django 3.1.6 on 2021-05-27 06:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Landing', '0005_auto_20210525_1532'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='all_capacity_updates',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='last_capacity_update',
        ),
        migrations.RemoveField(
            model_name='waitdata',
            name='numofpeople',
        ),
        migrations.RemoveField(
            model_name='waittimes',
            name='averagePeople',
        ),
    ]
