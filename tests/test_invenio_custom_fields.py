# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 Qulto.
#
# invenio-custom-fields is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Module tests."""

from flask import Flask

from invenio_custom_fields import inveniocustomfields


def test_version():
    """Test version import."""
    from invenio_custom_fields import __version__

    assert __version__


def test_init():
    """Test extension initialization."""
    app = Flask("testapp")
    ext = inveniocustomfields(app)
    assert "invenio-custom-fields" in app.extensions

    app = Flask("testapp")
    ext = inveniocustomfields()
    assert "invenio-custom-fields" not in app.extensions
    ext.init_app(app)
    assert "invenio-custom-fields" in app.extensions


def test_view(base_client):
    """Test view."""
    res = base_client.get("/")
    assert res.status_code == 200
    assert "Welcome to invenio-custom-fields" in str(res.data)
