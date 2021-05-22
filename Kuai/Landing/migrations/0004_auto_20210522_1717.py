# Generated by Django 3.0.8 on 2021-05-22 17:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Landing', '0003_auto_20210522_1618'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='skips',
            name='venue',
        ),
        migrations.AddField(
            model_name='skips',
            name='business',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='Landing.Business'),
        ),
    ]
