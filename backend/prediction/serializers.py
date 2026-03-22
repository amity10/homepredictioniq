from rest_framework import serializers

class PredictionSerializer(serializers.Serializer):
    bhk = serializers.IntegerField()
    area = serializers.FloatField()

    region = serializers.IntegerField(required=False)
    status = serializers.IntegerField(required=False)
    age = serializers.IntegerField(required=False)
    type = serializers.IntegerField(required=False)

    region_label = serializers.CharField(required=False, allow_blank=True)
    status_label = serializers.CharField(required=False, allow_blank=True)
    age_label = serializers.CharField(required=False, allow_blank=True)
    type_label = serializers.CharField(required=False, allow_blank=True)

