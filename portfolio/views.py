import requests
from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings
from .forms import ContactForm
 
# Create your views here.

def send_resend_email(to_email, subject, body):
    api_key = settings.RESEND_API_KEY
    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": subject,
            "text": body,
        },
        timeout=20,
    )
    response.raise_for_status()
    return response.json()

def home(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            contact = form.save()
            try:
                send_resend_email(
                    settings.CONTACT_EMAIL,
                    f"Portfolio Contact: {contact.subject}",
                    (
                        f"Name: {contact.name}\n"
                        f"Email: {contact.email}\n"
                        f"Subject: {contact.subject}\n\n"
                        f"Message:\n{contact.message}"
                    ),
                )
                send_resend_email(
                    contact.email,
                    "Thank You for Reaching Out!",
                    (
                        f"Hi {contact.name},\n\n"
                        "Thank you for reaching out and taking the time "
                        "to share your thoughts with me!\n\n"
                        "I've successfully received your message and "
                        "truly appreciate your interest in connecting "
                        "with me. I'll review your message and get "
                        "back to you as soon as possible.\n\n"
                        "Thank you again!\n\n"
                        "Best regards,\n"
                        "Uma Satya Santosh\n"
                        "Python Full-Stack Developer"
                    ),
                )
                messages.success(
                    request,
                    "Thank you! Your message has been sent successfully."
                )
            except Exception as e:
                print("RESEND EMAIL ERROR:", repr(e))
                messages.warning(
                    request,
                    "Your message was saved, but an email could not be sent."
                )
            return redirect("home")
    else:
        form = ContactForm()
    return render(request, "portfolio/home.html", {"form": form})