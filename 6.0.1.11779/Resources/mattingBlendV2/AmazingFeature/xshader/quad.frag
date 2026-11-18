precision lowp float;
varying highp vec2 uv0;
uniform sampler2D u_albedo;
uniform sampler2D u_mattingmask;
uniform float u_blendMode;
uniform vec4 u_previewColor;
uniform vec2 u_maskTexSize;
uniform float u_useSmoothingMask;

float smoothing_sample_mask(sampler2D tex, vec2 uv, float kernel)
{
    vec2 u_maskTexStep = vec2(1.0 / u_maskTexSize.x, 1.0 / u_maskTexSize.y);

    // for 3x3 gaussian kernel with 2.0
    float left_top     = texture2D(tex, uv + vec2(-u_maskTexStep.x, u_maskTexStep.y)).r;
    float left         = texture2D(tex, uv + vec2(-u_maskTexStep.x, 0.0)).r * kernel;
    float left_bottom  = texture2D(tex, uv + vec2(-u_maskTexStep.x, -u_maskTexStep.y)).r;
    
    float top          = texture2D(tex, uv + vec2(0.0, u_maskTexStep.y)).r * kernel;
    float center       = texture2D(tex, uv + vec2(0.0, 0.0)).r * kernel * kernel;
    float bottom       = texture2D(tex, uv + vec2(0.0, -u_maskTexStep.y)).r * kernel;
    
    float right_top    = texture2D(tex, uv + vec2(u_maskTexStep.x, u_maskTexStep.y)).r;
    float right        = texture2D(tex, uv + vec2(u_maskTexStep.x, 0.0)).r * kernel;
    float right_bottom = texture2D(tex, uv + vec2(u_maskTexStep.x, -u_maskTexStep.y)).r;
    
    float pixelNum = 4.0 + 4.0 * kernel + kernel * kernel;
    return (left_top + left + left_bottom + top + center + bottom + right_top + right + right_bottom) / pixelNum;
}

void main()
{
    vec4 inputColor = texture2D(u_albedo, uv0);
    vec4 bgColor = mix(vec4(0),inputColor,u_blendMode);
    vec4 fColor = mix(inputColor,u_previewColor,u_previewColor.a);
    fColor = mix(inputColor,fColor,u_blendMode);
    fColor.a = 1.;
    // u_useSmoothingMask 0.0 means disable, 1.0 means enable
    if (u_useSmoothingMask < 0.5) {
        gl_FragColor = mix(bgColor,fColor,texture2D(u_mattingmask, uv0).r);
    } else {
        gl_FragColor = mix(bgColor,fColor,smoothing_sample_mask(u_mattingmask, uv0, 4.0));
    }
}
