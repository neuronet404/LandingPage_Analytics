import { useSettings } from '@/context/SettingsContext';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import pdfsearch from '@/public/pdfsearch.svg';
import { ChevronUp, ChevronDown } from 'lucide-react';
import _ from 'lodash';

const SearchComponent = ({ scrollToPage }) => {
    const [searchText, setSearchText] = useState('');
    const [currentMatch, setCurrentMatch] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);
    const [highlights, setHighlights] = useState([]);
    const searchInputRef = useRef(null);
    const searchBarRef = useRef(null);
    const { pages, scale, currentPage } = useSettings();
    
    // Store match information for persistence across renders
    const matchesRef = useRef([]);

    const clearHighlights = () => {
        document.querySelectorAll('.pdf-search-highlight').forEach(el => {
            el.remove();
        });
        setHighlights([]);
    };

    const createHighlightElement = (node, startOffset, endOffset, matchIndex, pageNumber) => {
        const range = document.createRange();
        const textNode = node.firstChild;
        
        if (!textNode) return null;
        
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, endOffset);
        
        const rects = range.getClientRects();
        if (rects.length === 0) return null;

        const pdfPage = node.closest('.textLayer');
        if (!pdfPage) return null;

        const pageRect = pdfPage.getBoundingClientRect();
        const highlights = [];

        // Create highlight for each rect (handles multi-line text)
        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            const highlight = document.createElement('div');
            highlight.classList.add('pdf-search-highlight');
            highlight.style.position = 'absolute';
            highlight.style.left = `${rect.left - pageRect.left}px`;
            highlight.style.top = `${rect.top - pageRect.top}px`;
            highlight.style.width = `${rect.width}px`;
            highlight.style.height = `${rect.height}px`;
            highlight.style.backgroundColor = '#FFEB3B80';
            highlight.style.mixBlendMode = 'multiply';
            highlight.style.pointerEvents = 'none';
            highlight.dataset.highlightIndex = matchIndex;
            highlight.dataset.pageNumber = pageNumber;

            pdfPage.appendChild(highlight);
            highlights.push(highlight);
        }

        return highlights;
    };

    // Function to store search matches for persistence
    const storeMatches = (searchText) => {
        if (!searchText.trim()) return [];
        
        const matches = [];
        // Loop through all currently visible textLayers
        const textLayers = document.querySelectorAll('.textLayer');
        
        textLayers.forEach((textLayer, i) => {
            const pageNumber = i;
            const textNodes = Array.from(textLayer.querySelectorAll('span'));
            
            textNodes.forEach(node => {
                const text = node.textContent;
                const lowerText = text.toLowerCase();
                const lowerSearch = searchText.toLowerCase();
                let position = 0;
                
                while ((position = lowerText.indexOf(lowerSearch, position)) !== -1) {
                    matches.push({
                        pageNumber,
                        nodeText: node.textContent, // Store the text content for later matching
                        startOffset: position,
                        endOffset: position + searchText.length,
                        text: text.substr(position, searchText.length)
                    });
                    position += searchText.length;
                }
            });
        });
        
        return matches;
    };
    
    // Function to apply stored highlights to visible pages
    const applyStoredHighlights = () => {
        if (matchesRef.current.length === 0) return;
        
        clearHighlights();
        let matchIndex = 0;
        const newHighlights = [];
        
        matchesRef.current.forEach(match => {
            // Try to find the node in the current DOM
            const textLayers = document.querySelectorAll('.textLayer');
            const textLayer = textLayers[match.pageNumber];
            
            if (textLayer) {
                // Find the text node that contains this text
                const textNodes = Array.from(textLayer.querySelectorAll('span'));
                const node = textNodes.find(n => n.textContent === match.nodeText);
                
                if (node) {
                    const highlightElements = createHighlightElement(
                        node,
                        match.startOffset,
                        match.endOffset,
                        matchIndex,
                        match.pageNumber
                    );
                    
                    if (highlightElements) {
                        highlightElements.forEach(element => {
                            newHighlights.push({
                                element,
                                pageNumber: match.pageNumber,
                                index: matchIndex,
                                text: match.text
                            });
                        });
                        matchIndex++;
                    }
                }
            }
        });
        
        setHighlights(newHighlights);
    };
    
    // Debounced search function
    const debouncedSearch = useRef(
        _.debounce((searchText) => {
            clearHighlights();
            setCurrentMatch(0);
            setTotalMatches(0);
            
            // Store all matches - this will be used to re-apply highlights when pages come into view
            const matches = storeMatches(searchText);
            matchesRef.current = matches;
            
            // Apply highlights to currently visible pages
            applyStoredHighlights();
            
            setTotalMatches(matches.length);
            if (matches.length > 0) {
                setTimeout(() => scrollToHighlight(0), 100);
            }
        }, 300)
    ).current;

    const handleSearch = (e) => {
        e?.preventDefault();
        if (!searchText) return;
        debouncedSearch(searchText);
    };

    const scrollToHighlight = (index) => {
        // We need to account for possibly missing highlights in the DOM due to virtualization
        if (matchesRef.current.length === 0) return;
        
        // Handle wrapping
        if (index >= matchesRef.current.length) index = 0;
        if (index < 0) index = matchesRef.current.length - 1;
        
        // Get the match info from our stored matches
        const targetMatch = matchesRef.current[index];
        if (!targetMatch) return;
        
        // Reset all visible highlights to default color
        const highlightElements = document.querySelectorAll('.pdf-search-highlight');
        highlightElements.forEach(el => {
            el.style.backgroundColor = '#FFEB3B80';
            el.classList.remove('current-highlight');
        });
        
        // Scroll to the page containing this match first
        const pageNumber = targetMatch.pageNumber;
        if (scrollToPage && typeof scrollToPage === 'function') {
            scrollToPage(pageNumber);
            
            // We need to wait for the page to render before highlighting
            setTimeout(() => {
                // Now that the page is visible, re-apply highlights and find our target
                applyStoredHighlights();
                
                // Find the current highlight element with the correct index and page
                const allHighlights = document.querySelectorAll('.pdf-search-highlight');
                let currentElement = null;
                
                for (let i = 0; i < allHighlights.length; i++) {
                    const el = allHighlights[i];
                    if (parseInt(el.dataset.highlightIndex) === index && 
                        parseInt(el.dataset.pageNumber) === pageNumber) {
                        currentElement = el;
                        break;
                    }
                }
                
                if (currentElement) {
                    currentElement.style.backgroundColor = '#FF980080';
                    currentElement.classList.add('current-highlight');
                    
                    // Scroll to the specific highlight
                    currentElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                
                setCurrentMatch(index + 1);
            }, 300); // Increased timeout to give the virtualized list time to render
        }
    };

    const handleNext = () => {
        scrollToHighlight(currentMatch);
    };

    const handlePrevious = () => {
        scrollToHighlight(currentMatch - 2);
    };

    const clearSearch = () => {
        setSearchText('');
        setTotalMatches(0);
        setCurrentMatch(0);
        clearHighlights();
        matchesRef.current = [];
    };

    useEffect(() => {
        return () => {
            clearHighlights();
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch();
        }, 400);
    
        return () => clearTimeout(delayDebounceFn);
    }, [scale]);
    
    // Re-apply highlights when new pages come into view
    useEffect(() => {
        // This should run whenever the List component re-renders pages
        if (searchText && matchesRef.current.length > 0) {
            applyStoredHighlights();
        }
    }, [currentPage]); // Re-apply when current page changes

    // Handle window resize
    useEffect(() => {
        const handleResize = _.debounce(() => {
            if (searchText && matchesRef.current.length > 0) {
                applyStoredHighlights();
            }
        }, 300);

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            handleResize.cancel();
        };
    }, [searchText]);

    return (
        <div>
            <div
                ref={searchBarRef}
                className="fixed top-32 left-0 right-0 flex justify-center z-50 mt-4"
            >
                <form
                    className="w-[850px] relative group"
                    onSubmit={handleSearch}
                >
                    <div className="relative w-full h-[43px] group-hover:h-[68px] bg-white rounded-[18px] shadow-lg border border-gray-300 overflow-hidden transition-all duration-300 ease-in-out">
                        {/* Search Icon */}
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-4">
                            <Image src={pdfsearch} alt="Search Icon" width={16} height={16} />
                        </div>

                        {/* Search Input */}
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                if (e.target.value) {
                                    debouncedSearch(e.target.value);
                                } else {
                                    clearSearch();
                                }
                            }}
                            placeholder="Search in PDF..."
                            className="w-full py-2 pl-16 pr-32 font-rubik text-[20px] text-black focus:outline-none h-[43px] transition-colors duration-300"
                        />

                        {/* Navigation Controls */}
                        {totalMatches > 0 && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                    {currentMatch} of {totalMatches}
                                </span>
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    aria-label="Previous match"
                                >
                                    <ChevronUp className="w-4 h-4 text-black" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    aria-label="Next match"
                                >
                                    <ChevronDown className="w-4 h-4 text-black" />
                                </button>
                            </div>
                        )}

                        {/* Additional Placeholder Area */}
                        <div className="absolute top-[40px] pl-16 w-full text-black text-[15px] px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Ask acolyte?
                        </div>
                    </div>
                </form>
            </div>

            {/* Add global styles for highlights */}
            <style jsx global>{`
                .pdf-search-highlight {
                    position: absolute;
                    pointer-events: none;
                    transition: background-color 0.2s ease;
                    z-index: 1;
                }
                .current-highlight {
                    box-shadow: 0 0 4px rgba(255, 152, 0, 0.5);
                }
                .textLayer {
                    position: relative;
                }
            `}</style>
        </div>
    );
};
export default SearchComponent;




// export function PDFTextSearch({ pdfDocument, numPages }) {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [foundMatches, setFoundMatches] = useState([]);
//     const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
//     const handleSearch = async () => {
//       if (!pdfDocument || !searchTerm) return;
//       let matches = [];
  
//       for (let i = 1; i <= numPages; i++) {
//         const page = await pdfDocument.getPage(i);
//         const textContent = await page.getTextContent();
        
//         let matchIndices = [];
//         let fullText = "";
//         let textPositions = [];
  
//         textContent.items.forEach((item, index) => {
//           fullText += item.str + " ";
//           textPositions.push({ text: item.str, bbox: item.transform, index });
//         });
  
//         let searchRegex = new RegExp(searchTerm, "gi");
//         let match;
//         while ((match = searchRegex.exec(fullText)) !== null) {
//           matchIndices.push({ page: i, index: match.index });
//         }
  
//         matchIndices.forEach(({ page, index }) => {
//           const matchedItem = textPositions.find((t) => fullText.indexOf(t.text) === index);
//           if (matchedItem) {
//             matches.push({ page, bbox: matchedItem.bbox });
//           }
//         });
//       }
  
//       setFoundMatches(matches);
//       setCurrentMatchIndex(0);
//       if (matches.length > 0) scrollToMatch(0);
//     };
  
//     const scrollToMatch = (matchIndex) => {
//       if (foundMatches.length === 0) return;
//       setCurrentMatchIndex(matchIndex);
//       const match = foundMatches[matchIndex];
//       const pageElement = document.querySelector(`[data-page-number='${match.page}']`);
  
//       if (pageElement) {
//         pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
//       }
//     };
  
//     return (
//       <div className="p-4">
//         <div className="flex gap-2 mb-4">
//           <Input
//             type="text"
//             placeholder="Search text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Button onClick={handleSearch}>Search</Button>
//         </div>
  
//         {foundMatches.length > 0 && (
//           <div className="flex gap-2 items-center">
//             <Button onClick={() => scrollToMatch(Math.max(0, currentMatchIndex - 1))}>Prev</Button>
//             <span>
//               {currentMatchIndex + 1} / {foundMatches.length}
//             </span>
//             <Button onClick={() => scrollToMatch(Math.min(foundMatches.length - 1, currentMatchIndex + 1))}>
//               Next
//             </Button>
//           </div>
//         )}
  
//         {foundMatches.map((match, index) => (
//           <div
//             key={index}
//             className="absolute bg-yellow-300 opacity-50"
//             style={{
//               left: `${match.bbox[4]}px`,
//               top: `${match.bbox[5]}px`,
//               width: "100px",
//               height: "20px",
//             }}
//           />
//         ))}
//       </div>
//     );
//   }