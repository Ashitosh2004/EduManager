import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Search, MoreVertical } from 'lucide-react';

// Types for the manager UI components
export interface ManagerHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export interface ManagerToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

export interface EntityCardProps {
  children: ReactNode;
  department?: string;
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  'data-testid'?: string;
}

export interface DepartmentCardProps {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  onClick?: () => void;
  'data-testid'?: string;
}

/**
 * Consistent header component for all managers
 */
export const ManagerHeader: React.FC<ManagerHeaderProps> = ({
  title,
  subtitle,
  onBack,
  actions
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--manager-header-fg)' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * Consistent toolbar component with search and filters
 */
export const ManagerToolbar: React.FC<ManagerToolbarProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  children
}) => {
  return (
    <div className="flex items-center justify-between space-x-4">
      {/* Search */}
      {onSearchChange && (
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      )}
      
      {/* Additional toolbar items */}
      {children && (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Entity card with department color scoping
 */
export const EntityCard: React.FC<EntityCardProps> = ({
  children,
  department,
  onClick,
  className = '',
  'data-testid': testId
}) => {
  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} ${className}`}
      onClick={onClick}
      data-dept={department}
      data-testid={testId}
    >
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
};

/**
 * Department selection card with consistent styling
 */
export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  id,
  name,
  icon: Icon,
  count,
  onClick,
  'data-testid': testId
}) => {
  return (
    <EntityCard
      department={id}
      onClick={onClick}
      data-testid={testId}
      className="dept-card-accent"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
          <Icon className="h-6 w-6 dept-icon" />
        </div>
        {count !== undefined && (
          <span className="text-2xl font-bold text-foreground">{count}</span>
        )}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground">{id.toUpperCase()} Department</p>
    </EntityCard>
  );
};

/**
 * Empty state component for when no data is present
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  'data-testid': testId
}) => {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} data-testid="button-empty-action">
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Utility component for consistent department chip styling
 */
export const DepartmentChip: React.FC<{ 
  department: string; 
  children: ReactNode;
  className?: string;
}> = ({ department, children, className = '' }) => {
  return (
    <Badge 
      variant="secondary" 
      className={`dept-chip ${className}`}
      data-dept={department}
    >
      {children}
    </Badge>
  );
};

/**
 * Student/Faculty/Course entity card with actions
 */
export const PersonCard: React.FC<{
  name: string;
  identifier: string; // Roll number, employee ID, course code
  email?: string;
  department?: string;
  additionalInfo?: Array<{ label: string; value: string }>;
  onEdit?: () => void;
  onDelete?: () => void;
  'data-testid'?: string;
}> = ({
  name,
  identifier,
  email,
  department,
  additionalInfo = [],
  onEdit,
  onDelete,
  'data-testid': testId
}) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <EntityCard department={department} data-testid={testId}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-sm">
              {initials}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{identifier}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="p-1" data-testid="button-more-actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2 text-sm">
        {email && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="text-foreground truncate">{email}</span>
          </div>
        )}
        {additionalInfo.map((info, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-muted-foreground">{info.label}:</span>
            <span className="text-foreground">{info.value}</span>
          </div>
        ))}
      </div>
      
      {(onEdit || onDelete) && (
        <div className="flex space-x-2 mt-4">
          {onEdit && (
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit} data-testid="button-edit">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={onDelete}
              data-testid="button-delete"
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </EntityCard>
  );
};