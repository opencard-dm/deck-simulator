
update-image:
	yarn build
	docker-compose build
	node tools/push.js
