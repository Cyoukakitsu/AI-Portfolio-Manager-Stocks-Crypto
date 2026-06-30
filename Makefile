IMAGE = asia-east1-docker.pkg.dev/portfoliox-501013/portfoliox/app:latest

build:
	docker build --platform linux/amd64 -t $(IMAGE) .

push:
	docker push $(IMAGE)

deploy:
	gcloud run deploy portfoliox \
		--image $(IMAGE) \
		--platform managed \
		--region asia-east1

release: build push deploy
