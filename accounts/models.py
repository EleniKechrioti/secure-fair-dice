from django.db import models

class AppUser(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)

    def __str__(self):
        return self.username