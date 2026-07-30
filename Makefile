PYTHON  := .venv/bin/python
PIP     := .venv/bin/pip
UVICORN := .venv/bin/uvicorn

.PHONY: all setup dev frontend backend clean

all: dev

setup:
	$(PIP) install -r requirements.txt
	cd frontend && npm install

frontend:
	cd frontend && npm run dev

backend:
	$(UVICORN) backend.app.main:app --reload --host 127.0.0.1 --port 8000

run:
	$(MAKE) -j2 frontend backend

clean:
	rm -rf frontend/.next
	find . -type d -name "__pycache__" -prune -exec rm -rf {} +