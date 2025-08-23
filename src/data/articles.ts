import { useState } from "react";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

export interface Article {
  id: string; // Číslo článku (Article Number)
  name: string; // Název
  shelf: string; // Regál
  shelfNumber: string; // Číslo regálu
  location: string; // Např. "Ulička A, Regál 12"
  floor: string;    // Např. "Patro 3"
  warehouseId: string; // ID skladu, ke kterému článek patří
}

const initialArticles: Article[] = [
  { id: "ART-001", name: "Deka 'Teplo'", shelf: "Ulička A", shelfNumber: "01", location: "Ulička A, Regál 01", floor: "Patro 1", warehouseId: "Sklad 1" },
  { id: "ART-002", name: "Polštář 'Měkký'", shelf: "Ulička A", shelfNumber: "02", location: "Ulička A, Regál 02", floor: "Patro 1", warehouseId: "Sklad 1" },
  { id: "ART-003", name: "Stůl 'Jídelní'", shelf: "Ulička B", shelfNumber: "05", location: "Ulička B, Regál 05", floor: "Patro 2", warehouseId: "Sklad 1" },
  { id: "ART-004", name: "Židle 'Pohodlná'", shelf: "Ulička C", shelfNumber: "10", location: "Ulička C, Regál 10", floor: "Patro 3", warehouseId: "Sklad 1" },
  { id: "ART-005", name: "Skříň 'Šatní'", shelf: "Ulička D", shelfNumber: "03", location: "Ulička D, Regál 03", floor: "Patro 1", warehouseId: "Sklad 2" },
  { id: "ART-006", name: "Lampa 'Stolní'", shelf: "Ulička E", shelfNumber: "07", location: "Ulička E, Regál 07", floor: "Patro 2", warehouseId: "Sklad 2" },
  { id: "ART-007", name: "Koberec 'Vlněný'", shelf: "Ulička F", shelfNumber: "15", location: "Ulička F, Regál 15", floor: "Patro 3", warehouseId: "Sklad 2" },
  { id: "ART-008", name: "Váza 'Skleněná'", shelf: "Ulička G", shelfNumber: "08", location: "Ulička G, Regál 08", floor: "Patro 1", warehouseId: "Sklad 1" },
  { id: "ART-009", name: "Zrcadlo 'Nástěnné'", shelf: "Ulička H", shelfNumber: "04", location: "Ulička H, Regál 04", floor: "Patro 2", warehouseId: "Sklad 2" },
  { id: "ART-010", name: "Knihovna 'Dřevěná'", shelf: "Ulička I", shelfNumber: "11", location: "Ulička I, Regál 11", floor: "Patro 3", warehouseId: "Sklad 1" },
  { id: "ART-011", name: "Matrace 'Ortopedická'", shelf: "Ulička J", shelfNumber: "06", location: "Ulička J, Regál 06", floor: "Patro 2", warehouseId: "Sklad 1" },
  { id: "ART-012", name: "Noční stolek 'Malý'", shelf: "Ulička K", shelfNumber: "09", location: "Ulička K, Regál 09", floor: "Patro 1", warehouseId: "Sklad 2" },
  { id: "ART-013", name: "Pohovka 'Rohová'", shelf: "Ulička L", shelfNumber: "12", location: "Ulička L, Regál 12", floor: "Patro 3", warehouseId: "Sklad 1" },
  { id: "ART-014", name: "Obraz 'Abstraktní'", shelf: "Ulička M", shelfNumber: "01", location: "Ulička M, Regál 01", floor: "Patro 1", warehouseId: "Sklad 2" },
  { id: "ART-015", name: "Květináč 'Keramický'", shelf: "Ulička N", shelfNumber: "03", location: "Ulička N, Regál 03", floor: "Patro 2", warehouseId: "Sklad 1" },
];

export const useArticles = () => {
  const { userWarehouseId, isAdmin } = useAuth(); // Get user's warehouse ID and admin status
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  // Filter articles based on user's warehouseId if not an admin
  const filteredArticles = isAdmin
    ? articles
    : articles.filter((article) => article.warehouseId === userWarehouseId);

  const getArticleById = (id: string) => filteredArticles.find((article) => article.id === id);

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

  return { articles: filteredArticles, getArticleById, addArticle, updateArticle, deleteArticle };
};