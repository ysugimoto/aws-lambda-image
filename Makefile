.PHONY: test clean configtest

lambda:
	@echo "Factory package files..."
	@if [ ! -d build ] ;then mkdir build; fi
	@cp index.js build/index.js
	@cp config.json build/config.json
	@if [ ! -d build/node_modules ] ;then mkdir build/node_modules; fi
	@cp -R node_modules/aws-sdk build/node_modules/
	@cp -R node_modules/xmlbuilder build/node_modules/
	@cp -R node_modules/sax build/node_modules/
	@cp -R node_modules/xml2js build/node_modules/
	@cp -R node_modules/es6-promise build/node_modules/
	@cp -R node_modules/imagemagick build/node_modules/
	@cp -R libs build/
	@cp -R bin build/
	@rm -rf build/bin/darwin
	@echo "Create package archive..."
	@cd build && zip -rq aws-lambda-image.zip .
	@mv build/aws-lambda-image.zip ./

test:
	./node_modules/mocha/bin/_mocha -R spec --timeout 10000 tests/*.test.js

configtest:
	@./bin/configtest
	

clean:
	@echo "clean up package files"
	@if [ -f aws-lambda-image.zip ]; then rm aws-lambda-image.zip; fi
	@rm -rf build/*
