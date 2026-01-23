import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import * as crypto from 'crypto';

// 配置
const config = {
    inputDir: './src/shaders', // GLSL源文件目录
    outputDir: './src/shaders', // 生成的JS文件目录
    template: 'es6', // 输出模板：'es6' | 'commonjs' | 'cesium'
    watch: true, // 是否监听文件变化
    minify: false, // 是否压缩GLSL代码
    verbose: true // 显示详细信息
};

// 创建目录
function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 压缩GLSL代码（简单的压缩）
function minifyGlsl(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '') // 删除多行注释
        .replace(/\/\/.*$/gm, '') // 删除单行注释
        .replace(/\s+/g, ' ') // 合并多个空格
        .replace(/\s*([{}()\[\];,+\-*/=<>!|&])\s*/g, '$1') // 删除操作符周围的空格
        .trim();
}

// 生成文件内容的哈希值（用于缓存）
function generateHash(content) {
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

// 解析GLSL文件，提取uniforms和attributes
function parseGlslFile(filePath, content) {
    const uniforms = [];
    const attributes = [];
    const functions = [];

    // 匹配uniform声明
    const uniformRegex = /uniform\s+(\w+)\s+(\w+)(?:\s*=\s*([^;]+))?/g;
    let match;

    while ((match = uniformRegex.exec(content)) !== null) {
        uniforms.push({
            type: match[1],
            name: match[2],
            defaultValue: match[3]?.trim()
        });
    }

    // 匹配attribute声明
    const attributeRegex = /attribute\s+(\w+)\s+(\w+)/g;
    while ((match = attributeRegex.exec(content)) !== null) {
        attributes.push({
            type: match[1],
            name: match[2]
        });
    }

    // 匹配函数定义
    const functionRegex = /(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
    while ((match = functionRegex.exec(content)) !== null) {
        functions.push({
            returnType: match[1],
            name: match[2],
            params: match[3]
        });
    }

    return { uniforms, attributes, functions };
}

// 根据模板生成JS文件内容
function generateJsContent(glslContent, fileName, config) {
    const minifiedContent = config.minify ? minifyGlsl(glslContent) : glslContent;
    const hash = generateHash(glslContent);
    const baseName = path.basename(fileName, '.glsl');
    const className = baseName.replace(/(^|_)(\w)/g, (match, p1, p2) => p2.toUpperCase());

    const parsed = parseGlslFile(fileName, glslContent);

    switch (config.template) {
        case 'es6':
            return generateEs6Template(minifiedContent, baseName, className, hash, parsed);
        case 'commonjs':
            return generateCommonJsTemplate(minifiedContent, baseName, className, hash, parsed);
        case 'cesium':
            return generateCesiumTemplate(minifiedContent, baseName, className, hash, parsed);
        default:
            return generateEs6Template(minifiedContent, baseName, className, hash, parsed);
    }
}

// ES6模块模板
function generateEs6Template(content, baseName, className, hash, parsed) {
    return `// Auto-generated from ${baseName}.glsl
// Hash: ${hash}
// Generated at: 罗君

const ${baseName.toUpperCase()}_SOURCE = \`
${content}
\`;

// Uniform 信息
export const ${baseName.toUpperCase()}_UNIFORMS = ${JSON.stringify(parsed.uniforms, null, 2)};

// Attribute 信息
export const ${baseName.toUpperCase()}_ATTRIBUTES = ${JSON.stringify(parsed.attributes, null, 2)};

// Shader 类
export class ${className}Shader {
  constructor() {
    this.source = ${baseName.toUpperCase()}_SOURCE;
    this.uniforms = ${baseName.toUpperCase()}_UNIFORMS;
    this.attributes = ${baseName.toUpperCase()}_ATTRIBUTES;
    this.hash = '${hash}';
  }
  
  getVertexShader() {
    return this.source;
  }
  
  getFragmentShader() {
    return this.source;
  }
  
  // 创建Cesium CustomShader配置
  toCesiumShader(uniformValues = {}) {
    const uniforms = {};
    this.uniforms.forEach(u => {
      uniforms[u.name] = {
        value: uniformValues[u.name] || this.parseDefaultValue(u.defaultValue),
        type: this.mapGlslTypeToCesium(u.type)
      };
    });
    
    return {
      vertexShaderText: this.source,
      fragmentShaderText: this.source,
      uniforms
    };
  }
  
  parseDefaultValue(defaultValue) {
    if (!defaultValue) return null;
    // 这里可以添加类型解析逻辑
    return defaultValue;
  }
  
  mapGlslTypeToCesium(glslType) {
    const typeMap = {
      'float': 'FLOAT',
      'vec2': 'VEC2',
      'vec3': 'VEC3',
      'vec4': 'VEC4',
      'mat4': 'MAT4',
      'sampler2D': 'SAMPLER_2D'
    };
    return typeMap[glslType] || 'FLOAT';
  }
}

export default ${baseName.toUpperCase()}_SOURCE;`;
}

// Cesium专用模板
function generateCesiumTemplate(content, baseName, className, hash, parsed) {
    return `// Auto-generated Cesium shader from ${baseName}.glsl
// Hash: ${hash}
// Generated at: ${new Date().toISOString()}

import * as Cesium from 'cesium';

const ${baseName.toUpperCase()}_SOURCE = \`
${content}
\`;

// 解析uniforms为Cesium格式
function parseUniforms() {
  const uniforms = {};
  
  // 这里添加你的uniform解析逻辑
  ${parsed.uniforms
      .map(
          (u) => `
  // ${u.type} ${u.name}
  uniforms.${u.name} = {
    value: ${u.defaultValue || 'null'},
    type: Cesium.UniformType.${u.type.toUpperCase()}
  };`
      )
      .join('\n')}
  
  return uniforms;
}

// 创建CustomShader
export function create${className}Shader(options = {}) {
  const uniforms = parseUniforms();
  
  // 合并用户提供的uniform值
  Object.keys(options.uniforms || {}).forEach(key => {
    if (uniforms[key]) {
      uniforms[key].value = options.uniforms[key];
    }
  });
  
  return new Cesium.CustomShader({
    vertexShaderText: ${baseName.toUpperCase()}_SOURCE,
    fragmentShaderText: ${baseName.toUpperCase()}_SOURCE,
    uniforms: {
      ...uniforms,
      ...(options.additionalUniforms || {})
    }
  });
}

// 直接导出源文件
export const ${baseName}ShaderSource = ${baseName.toUpperCase()}_SOURCE;

// 导出shader构建器
export default {
  create: create${className}Shader,
  source: ${baseName.toUpperCase()}_SOURCE,
  uniforms: parseUniforms(),
  hash: '${hash}'
};`;
}

// 处理单个文件
function processFile(filePath, config) {
    try {
        const relativePath = path.relative(config.inputDir, filePath);
        const outputPath = path.join(config.outputDir, relativePath).replace('.glsl', '.js');

        // 读取GLSL文件
        const glslContent = fs.readFileSync(filePath, 'utf8');

        // 生成JS内容
        const jsContent = generateJsContent(glslContent, path.basename(filePath), config);

        // 确保输出目录存在
        ensureDirectory(path.dirname(outputPath));

        // 写入JS文件
        fs.writeFileSync(outputPath, jsContent, 'utf8');

        if (config.verbose) {
            console.log(`✓ ${relativePath} → ${path.relative(config.outputDir, outputPath)}`);
        }
    } catch (error) {
        console.error(`✗ 处理文件失败: ${filePath}`, error);
    }
}

// 处理所有GLSL文件
function processAllFiles(config) {
    const files = getAllGlslFiles(config.inputDir);
    console.log(`找到 ${files.length} 个GLSL文件`);

    files.forEach((file) => {
        processFile(file, config);
    });
}

// 获取所有GLSL文件
function getAllGlslFiles(dir) {
    const files = [];

    function walk(directory) {
        const items = fs.readdirSync(directory);

        items.forEach((item) => {
            const fullPath = path.join(directory, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (item.endsWith('.glsl') || item.endsWith('.vert') || item.endsWith('.frag')) {
                files.push(fullPath);
            }
        });
    }

    walk(dir);
    return files;
}

// 主函数
function main() {
    ensureDirectory(config.outputDir);

    if (config.watch) {
        console.log(`开始监听 ${config.inputDir} 目录...`);

        const watcher = chokidar.watch(config.inputDir, {
            ignored: /(^|[\/\\])\../, // 忽略隐藏文件
            persistent: true,
            ignoreInitial: false,
            depth: 10
        });

        watcher
            .on('add', (filePath) => {
                if (filePath.endsWith('.glsl')) {
                    processFile(filePath, config);
                }
            })
            .on('change', (filePath) => {
                if (filePath.endsWith('.glsl')) {
                    console.log(`📝 检测到变化: ${path.relative(config.inputDir, filePath)}`);
                    processFile(filePath, config);
                }
            })
            .on('unlink', (filePath) => {
                if (filePath.endsWith('.glsl')) {
                    const jsPath = filePath
                        .replace(config.inputDir, config.outputDir)
                        .replace('.glsl', '.js');
                    if (fs.existsSync(jsPath)) {
                        fs.unlinkSync(jsPath);
                        console.log(`🗑️  删除: ${path.relative(config.outputDir, jsPath)}`);
                    }
                }
            })
            .on('error', (error) => {
                console.error('监听错误:', error);
            });
    } else {
        processAllFiles(config);
        console.log('处理完成！');
    }
}

// 解析命令行参数
function parseArgs() {
    const args = process.argv.slice(2);
    args.forEach((arg) => {
        if (arg === '--once') {
            config.watch = false;
        } else if (arg === '--no-minify') {
            config.minify = false;
        } else if (arg === '--commonjs') {
            config.template = 'commonjs';
        } else if (arg === '--cesium') {
            config.template = 'cesium';
        }
    });
}

// 启动
parseArgs();
main();
