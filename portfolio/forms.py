from django import forms
from .models import ContactMessage
class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ["name", "email", "subject", "message"]
        widgets = {
            "name": forms.TextInput(attrs={
                "placeholder": "Your name"
            }),
            "email": forms.EmailInput(attrs={
                "placeholder": "Your email address"
            }),
            "subject": forms.TextInput(attrs={
                "placeholder": "What is this about?"
            }),
            "message": forms.Textarea(attrs={
                "placeholder": "Write your message here...",
                "rows": 5
            }),
        }