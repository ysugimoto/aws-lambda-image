.PHONY: test clean configtest
AWS_PROFILE ?= "default"

lambda:
	npm install .
	@echo "Factory package files..."
	@if [ ! -d build ] ;then mkdir build; fi
	@cp index.js build/index.js
	@cp config.json build/config.json
	@if [ -d build/node_modules ] ;then rm -rf build/node_modules; fi
	@cp -R node_modules build/node_modules
	@cp -R libs build/
	@cp -R bin build/
	@rm -rf build/bin/darwin
	@echo "Create package archive..."
	@cd build && zip -rq aws-lambda-image.zip .
	@mv build/aws-lambda-image.zip ./

uploadlambda: lambda
	@if [ -z "${LAMBDA_FUNCTION_NAME}" ]; then (echo "Please export LAMBDA_FUNCTION_NAME" && exit 1); fi
	@echo "Updating ${LAMBDA_FUNCTION_NAME} using ${AWS_PROFILE} AWS profile..."
	aws --profile ${AWS_PROFILE} lambda update-function-code --function-name ${LAMBDA_FUNCTION_NAME} --zip-file fileb://aws-lambda-image.zip

configtest:
	@./bin/configtest

clean:
	@echo "clean up package files"
	@if [ -f aws-lambda-image.zip ]; then rm aws-lambda-image.zip; fi
	@rm -rf build/*
