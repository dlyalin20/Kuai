# Generated by Django 3.1.6 on 2021-04-20 14:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Landing', '0016_auto_20210420_0958'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='temp_business',
            name='name',
        ),
    ]