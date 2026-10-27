from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from .forms import ContactForm

# Create your views here.
def home(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            contact = form.save()
            try:
                send_mail(
                    subject=f"Portfolio Contact: {contact.subject}",
                    message=(
                        f"Name: {contact.name}\n"
                        f"Email: {contact.email}\n"
                        f"Subject: {contact.subject}\n\n"
                        f"Message:\n{contact.message}"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.CONTACT_EMAIL],
                    fail_silently=False,)
                send_mail(
                    subject="Thank You for Reaching Out!",
                    message=(
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
                        "Python Full-Stack Developer"),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[contact.email],
                    fail_silently=False,)
                messages.success(request,'Thank you! Your message has been sent successfully.')
            except Exception as e:
                print("EMAIL ERROR:", repr(e))
                messages.warning(request,'Your message was saved, but an email could not be sent.')
            return redirect('home')
    else:
        form = ContactForm()
    return render(request, 'portfolio/home.html', {'form': form})