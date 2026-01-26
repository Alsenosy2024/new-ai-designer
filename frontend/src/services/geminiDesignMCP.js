const GEMINI_DESIGN_API_KEY = import.meta.env.VITE_GEMINI_DESIGN_API_KEY || 'gd_H-xso1nO5IgOfVvTDknD_XCmQfxmsJXi';
const GEMINI_DESIGN_MCP_URL = import.meta.env.VITE_GEMINI_DESIGN_MCP_URL || 'https://gemini-design-mcp-server-production.up.railway.app/mcp';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.aiDesignerApiBase) ||
  (typeof window !== 'undefined' ? window.location.origin : '') ||
  'http://localhost:8001';

class GeminiDesignMCP {
  constructor() {
    this.apiKey = GEMINI_DESIGN_API_KEY;
    this.mcpUrl = GEMINI_DESIGN_MCP_URL;
    this.apiBaseUrl = API_BASE_URL;
  }

  async generateDesign(prompt, context = {}) {
    try {
      const response = await fetch(this.mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          action: 'generate_design',
          prompt: prompt,
          context: context
        })
      });

      if (!response.ok) {
        console.warn('MCP returned error, using fallback');
        return this.getFallbackDesign(context);
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini Design MCP Error:', error);
      return this.getFallbackDesign(context);
    }
  }

  getFallbackDesign(context) {
    return {
      success: true,
      design: {
        layout: 'generated',
        components: [],
        message: 'Using local generation'
      },
      fallback: true
    };
  }

  async generateFloorPlan(projectData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectData })
      });
      
      const result = await response.json();
      const projectId = result.project.id;
      
      const runResponse = await fetch(`${this.apiBaseUrl}/api/runs/start?project_id=${projectId}&stage=full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return {
        success: true,
        projectId: projectId,
        status: 'started'
      };
    } catch (error) {
      console.error('Error generating floor plan:', error);
      return this.getFallbackDesign({ type: 'floor_plan', project: projectData });
    }
  }

  async generate3DVisualization(massingData) {
    const prompt = `Create 3D visualization for building`;
    return await this.generateDesign(prompt, { type: '3d', massing: massingData });
  }

  async checkProjectStatus(projectId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/state?project_id=${projectId}`);
      return await response.json();
    } catch (error) {
      console.error('Error checking status:', error);
      return null;
    }
  }
}

export const geminiDesignMCP = new GeminiDesignMCP();
export default geminiDesignMCP;
