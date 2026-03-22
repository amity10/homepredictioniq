from django.contrib import admin
from .models import PredictionLog, ContactLead

@admin.register(PredictionLog)
class PredictionLogAdmin(admin.ModelAdmin):
    list_display = ("email", "region_label", "bhk", "area", "predicted_price", "created_at")


@admin.register(ContactLead)
class ContactLeadAdmin(admin.ModelAdmin):
    list_display = ("email", "phone", "region_label", "bhk", "area", "predicted_price", "created_at")
