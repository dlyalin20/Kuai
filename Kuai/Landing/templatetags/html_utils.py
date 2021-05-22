def image_to_html(image):
    return '<img src="%(path)s" title="%(title)s" alt="%(alt)s" />' % {
        'path': image.raw.path,
        'title': image.title,
        'alt': image.alt_text
    }