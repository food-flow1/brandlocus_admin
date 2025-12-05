import React from 'react';

interface TextTemplateProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const TextTemplate: React.FC<TextTemplateProps> = ({
  title,
  subtitle,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) => {
  return (
    <div className={className}>
      <h2
        className={`text-2xl font-bold text-gray-900 mb-1 ${titleClassName}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-sm font-normal text-gray-500 ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default TextTemplate;