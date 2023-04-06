async function loadModel(path) {
    const response = await fetch(path);
    const text = await response.text();
    const obj = parseOBJ(text);

    var modelData = {
        positions: obj.objPositions,
        indices: obj.objIndices,
        vertexNormals: obj.objNormals,
        textureCoordinates: obj.objTexcoords
    }

    return modelData;
}

function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    var objPositions = [[0, 0, 0]];
    var objTexcoords = [[0, 0]];
    var objNormals = [[0, 0, 0]];
    var objIndices = [];

    const noop = () => { };

    const keywords = {
        v(parts) {
            objPositions.push(parts.map(parseFloat));
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            if (parts.length == 3) {
                for (var i = 0; i < 3; i++) {
                    var split = parts[i].split('/');
                    objIndices.push();
                }
            } else if (parts.length == 4) {
                var split = parts[0].split('/');
                objIndices.push(parseInt(split[0]));

                split = parts[1].split('/');
                objIndices.push(parseInt(split[0]));

                split = parts[2].split('/');
                objIndices.push(parseInt(split[0]));

                split = parts[0].split('/');
                objIndices.push(parseInt(split[0]));

                split = parts[3].split('/');
                objIndices.push(parseInt(split[0]));

                split = parts[2].split('/');
                objIndices.push(parseInt(split[0]));
            } else {
                throw new Exception();
            }


        },
        s: noop,    // smoothing group
        mtllib(parts, unparsedArgs) {
            // the spec says there can be multiple filenames here
            // but many exist with spaces in a single filename
            //materialLibs.push(unparsedArgs);
        },
        usemtl(parts, unparsedArgs) {
            //material = unparsedArgs;
        },
        g(parts) {
            //groups = parts;
        },
        o(parts, unparsedArgs) {
            // object = unparsedArgs;
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    var temp = []

    for (var i = 0; i < objPositions.length; i++) {
        for (var j = 0; j < objPositions[i].length; j++) {
            temp.push(objPositions[i][j]);
        }
    }

    objPositions = temp;

    /*temp = []

    for (var i = 0; i < objIndices.length; i++) {
        for (var j = 0; j < objIndices[i].length; j++) {
            temp.push(objIndices[i][j]);
        }
    }

    objIndices = temp;*/

    temp = []

    for (var i = 0; i < objTexcoords.length; i++) {
        for (var j = 0; j < objTexcoords[i].length; j++) {
            temp.push(objTexcoords[i][j]);
        }
    }

    objTexcoords = temp;

    temp = []

    for (var i = 0; i < objNormals.length; i++) {
        for (var j = 0; j < objNormals[i].length; j++) {
            temp.push(objNormals[i][j]);
        }
    }

    objNormals = temp;

    console.log(objPositions);
    console.log(objTexcoords);
    console.log(objNormals);
    console.log(objIndices);

    return {
        objPositions,
        objTexcoords,
        objNormals,
        objIndices
    }
}

export { loadModel }