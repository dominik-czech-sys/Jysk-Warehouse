import { useState } from "react";

export interface Article {
  id: string; // Article Number
  name: string;
  shelf: string;
  shelfNumber: string;
  location: string; // e.g., "Aisle A, Rack 12"
  floor: string;    // e.g., "Floor 3"
}

const initialArticles: Article[] = [
  { id: "ART-001", name: "Widget A", shelf: "Aisle A", shelfNumber: "01", location: "Aisle A, Rack 01", floor: "Floor 1" },
  { id: "ART-002", name: "Gadget B", shelf: "Aisle A", shelfNumber: "02", location: "Aisle A, Rack 02", floor: "Floor 1" },
  { id: "ART-003", name: "Thing C", shelf: "Aisle B", shelfNumber: "05", location: "Aisle B, Rack 05", floor: "Floor 2" },
  { id: "ART-004", name: "Doodad D", shelf: "Aisle C", shelfNumber: "10", location: "Aisle C, Rack 10", floor: "Floor 3" },
  { id: "ART-005", name: "Gizmo E", shelf: "Aisle D", shelfNumber: "03", location: "Aisle D, Rack 03", floor: "Floor 1" },
  { id: "ART-006", name: "Contraption F", shelf: "Aisle E", shelfNumber: "07", location: "Aisle E, Rack 07", floor: "Floor 2" },
  { id: "ART-007", name: "Apparatus G", shelf: "Aisle F", shelfNumber: "15", location: "Aisle F, Rack 15", floor: "Floor 3" },
  { id: "ART-008", name: "Mechanism H", shelf: "Aisle G", shelfNumber: "08", location: "Aisle G, Rack 08", floor: "Floor 1" },
  { id: "ART-009", name: "Device I", shelf: "Aisle H", shelfNumber: "04", location: "Aisle H, Rack 04", floor: "Floor 2" },
  { id: "ART-010", name: "Tool J", shelf: "Aisle I", shelfNumber: "11", location: "Aisle I, Rack 11", floor: "Floor 3" },
];

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  const getArticleById = (id: string) => articles.find((article) => article.id === id);

  const addArticle = (newArticle: Article) => {
    setArticles((prev) => [...prev, newArticle]);
  };

  const updateArticle = (updatedArticle: Article) => {
    setArticles((prev) =>
      prev.map((article) => (article.id === updatedArticle.id ? updatedArticle : article))
    );
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((article) => article.id !== id));
  };

  return { articles, getArticleById, addArticle, updateArticle, deleteArticle };
};