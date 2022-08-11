# Generated by Django 4.1 on 2022-08-08 21:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sharedtraits', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuestionModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.TextField()),
                ('answers', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='UserAnswerModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=20)),
                ('question', models.TextField()),
                ('answer', models.TextField()),
            ],
        ),
        migrations.DeleteModel(
            name='SharedTraits',
        ),
    ]