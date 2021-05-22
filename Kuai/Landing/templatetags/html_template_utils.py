from . import html_utils
from django import template

register = template.Library()

@register.simple_tag
def image_tag(image):
    return html_utils.image_to_html(image)