/**
 * AI Response Formatter
 * 
 * Formats AI responses with collapsible sections, bullet points, and better readability
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FormattedResponseProps {
  text: string;
}

interface Section {
  title: string;
  content: string;
  type: 'summary' | 'details' | 'list' | 'table' | 'text';
}

/**
 * Parse AI response into structured sections
 */
function parseResponse(text: string): Section[] {
  const sections: Section[] = [];
  
  // Try to identify structured content
  const lines = text.split('\n');
  let currentSection: Section | null = null;
  let buffer: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect headers (lines with ###, ##, **, or ending with ":")
    // Se añade soporte para markdown bold (**Texto**) como título, que es lo que suele usar Gemini
    const isBoldHeader = line.match(/^\*\*(.+)\*\*$/);
    if (line.match(/^#{1,3}\s+(.+)/) || (line.endsWith(':') && line.length < 60 && !line.includes('.')) || isBoldHeader) {
      
      let title = line;
      if (isBoldHeader) {
         title = line.replace(/^\*\*(.+)\*\*$/, '$1'); // Extraer solo el texto entre los asteriscos
      } else {
         title = line.replace(/^#{1,3}\s+/, '').replace(/:$/, '');
      }

      // Asegurarnos de que no repita el título si el contenido anterior ya se llamaba igual
      if (currentSection && currentSection.title === title) {
          // Si es el mismo título (error de IA), lo ignoramos y lo tomamos como parte del contenido
          buffer.push(line);
          continue;
      }

      // Save previous section
      if (currentSection && buffer.length > 0) {
        currentSection.content = buffer.join('\n').trim();
        sections.push(currentSection);
        buffer = [];
      }
      
      // Start new section
      const type = sections.length === 0 ? 'summary' : 'details';
      currentSection = { title, content: '', type };
    } 
    // Detect lists
    else if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
      if (!currentSection) {
        currentSection = { title: 'Detalles', content: '', type: 'list' };
      }
      if (currentSection.type !== 'list') {
        // Save previous and start list
        if (buffer.length > 0) {
          currentSection.content = buffer.join('\n').trim();
          sections.push(currentSection);
          buffer = [];
        }
        currentSection = { title: currentSection.title || 'Detalles', content: '', type: 'list' };
      }
      buffer.push(line);
    }
    // Regular text
    else if (line.length > 0) {
      if (!currentSection) {
        currentSection = { title: '', content: '', type: 'text' };
      }
      buffer.push(line);
    }
  }
  
  // Save final section
  if (currentSection && buffer.length > 0) {
    currentSection.content = buffer.join('\n').trim();
    sections.push(currentSection);
  }
  
  // If no structured content found, return as single text section
  if (sections.length === 0) {
    sections.push({ title: '', content: text, type: 'text' });
  }
  
  // Ensure first section is always expanded (summary)
  if (sections.length > 0 && sections[0].type !== 'summary') {
    sections[0].type = 'summary';
  }
  
  return sections;
}

/**
 * Format list items with proper styling
 */
function formatList(content: string): React.ReactElement {
  const items = content
    .split('\n')
    .map(line => line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim())
    .filter(line => line.length > 0);
  
  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="text-yellow-500 mt-1 flex-shrink-0">•</span>
          <span className="text-gray-200 text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Collapsible section component
 */
interface CollapsibleSectionProps {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ section, isOpen, onToggle }) => {
  // Summary type is always open and not collapsible
  if (section.type === 'summary' || section.type === 'text') {
    return (
      <div className="space-y-2">
        {section.title && (
          <h4 className="font-bold text-white text-sm">{section.title}</h4>
        )}
        <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
          {section.content}
        </div>
      </div>
    );
  }
  
  return (
    <div className="border border-neutral-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
      >
        <span className="font-semibold text-white text-sm">{section.title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-3 bg-neutral-900/30">
          {section.type === 'list' ? (
            formatList(section.content)
          ) : (
            <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {section.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Main formatted response component
 */
const FormattedResponse: React.FC<FormattedResponseProps> = ({ text }) => {
  const sections = parseResponse(text);
  const [openSections, setOpenSections] = useState<Set<number>>(
    new Set(sections.map((_, idx) => idx === 0 ? idx : -1).filter(i => i >= 0))
  );
  
  const toggleSection = (index: number) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenSections(newOpen);
  };
  
  // If response is short (<200 chars), show as plain text
  if (text.length < 200 || sections.length === 1) {
    return (
      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {sections.map((section, idx) => (
        <CollapsibleSection
          key={idx}
          section={section}
          isOpen={openSections.has(idx)}
          onToggle={() => toggleSection(idx)}
        />
      ))}
      
      {/* Expand all button if there are multiple collapsed sections */}
      {sections.length > 2 && (
        <button
          onClick={() => {
            const allIndices = sections.map((_, idx) => idx);
            setOpenSections(new Set(allIndices));
          }}
          className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
        >
          Ver todo
        </button>
      )}
    </div>
  );
};

export default FormattedResponse;
