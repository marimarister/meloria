import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronDown, ChevronUp, RotateCw } from "lucide-react";

interface FlipCardProps {
  title: string;
  description: string;
  purpose?: string;
  format?: string;
  duration?: string;
  languages?: string[];
  price?: string;
  idealFor?: string;
  image: string;
}

const FlipCard = ({
  title,
  description,
  purpose,
  format,
  duration,
  languages,
  price,
  idealFor,
  image,
}: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleFlipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
    setIsExpanded(false);
  };

  return (
    <div 
      className={`perspective-1000 cursor-pointer transition-all duration-300 ${isExpanded ? "h-auto min-h-[320px]" : "h-[320px]"}`}
      onClick={() => !isExpanded && setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="h-full border border-border/50 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow group">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-teal-800 group-hover:text-teal-600 transition-colors line-clamp-2">
                {title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {languages && languages.map((lang) => (
                  <Badge key={lang} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                    {lang}
                  </Badge>
                ))}
                {duration && (
                  <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                    <Clock className="w-3 h-3 mr-1" />
                    {duration}
                  </Badge>
                )}
                {price && (
                  <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">
                    {price}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {purpose && (
                <p className="text-sm">
                  <span className="font-medium text-purple-700">Purpose: </span>
                  <span className="text-muted-foreground">{purpose}</span>
                </p>
              )}
              <div>
                <p className={`text-muted-foreground text-sm leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}>
                  {description}
                </p>
                {description.length > 100 && (
                  <button
                    onClick={handleExpandClick}
                    className="text-xs text-teal-600 font-medium mt-1 flex items-center gap-1 hover:text-teal-700 transition-colors"
                  >
                    {isExpanded ? (
                      <>Show less <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>Show more <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                )}
              </div>
              <button
                onClick={handleFlipClick}
                className="text-xs text-teal-600 font-medium pt-2 flex items-center gap-1 hover:text-teal-700 transition-colors"
              >
                <RotateCw className="w-3 h-3" />
                Click to flip →
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Back of card */}
        <div 
          className="absolute inset-0 backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="h-full border border-border/50 overflow-hidden">
            <div className="relative h-full">
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{title}</h3>
                {format && (
                  <p className="text-sm text-white/80 line-clamp-1">{format}</p>
                )}
                {idealFor && (
                  <p className="text-xs text-white/70 mt-1">Ideal for: {idealFor}</p>
                )}
                <p className="text-xs text-white/60 mt-2">Click to flip back</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
