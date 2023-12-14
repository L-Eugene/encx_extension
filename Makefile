all: chrome firefox cleanup

firefox:
	rm -f manifest.json
	cp manifest.firefox.json manifest.json
	zip -r encx_extension_firefox.zip * --exclude \*.zip --exclude manifest.*.json --exclude Makefile

chrome:
	rm -f manifest.json
	cp manifest.chrome.json manifest.json
	zip -r encx_extension_chrome.zip * --exclude \*.zip --exclude manifest.*.json --exclude Makefile

cleanup:
	rm -f manifest.json
	ln -s manifest.firefox.json manifest.json
