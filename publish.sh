# https://github.com/ipfs/go-ipfs/issues/3400
ipfs add -q -r dist | tail -n 1 | xargs ipfs name publish