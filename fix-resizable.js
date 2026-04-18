const fs = require('fs');
const path = require('path');

const UI_DIRS = [
  './src/components/auth/register/ui',
  './src/components/auth/register/ui/subscription',
  './src/components/login/ui',
  './src/components/marketing/ui',
];

UI_DIRS.forEach(dir => {
  const file = path.join(dir, 'resizable.tsx');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace import
    content = content.replace(/import \* as ResizablePrimitiveRaw from 'react-resizable-panels'(\r?\n)const ResizablePrimitive = ResizablePrimitiveRaw as any/g, "import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'");
    content = content.replace(/import \* as ResizablePrimitive from 'react-resizable-panels'/g, "import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'");
    
    // Replace usages
    content = content.replace(/ResizablePrimitive\.PanelGroup/g, "PanelGroup");
    content = content.replace(/ResizablePrimitive\.PanelResizeHandle/g, "PanelResizeHandle");
    content = content.replace(/ResizablePrimitive\.Panel/g, "Panel");
    
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
});
