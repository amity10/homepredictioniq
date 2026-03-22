from django.db import models

class PredictionLog(models.Model):

    clerk_user_id = models.CharField(max_length=200)
    email = models.EmailField()
    name = models.CharField(max_length=200, blank=True)

    locality = models.CharField(max_length=200)

    region_label = models.CharField(max_length=200, blank=True)
    region_value = models.IntegerField(null=True)

    area = models.FloatField()
    bhk = models.IntegerField()
    predicted_price = models.FloatField()
    is_saved = models.BooleanField(default=False) # ⭐ NEW: Distinguish "Saved" vs "All"

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} | {self.locality} | ₹{self.predicted_price}"


class ContactLead(models.Model):

    clerk_user_id = models.CharField(max_length=200)
    email = models.EmailField()
    name = models.CharField(max_length=200, blank=True)

    phone = models.CharField(max_length=20)
    message = models.TextField(blank=True)

    bhk = models.IntegerField()
    area = models.FloatField()

    region_label = models.CharField(max_length=200)
    region_value = models.IntegerField()

    predicted_price = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} | {self.phone}"
