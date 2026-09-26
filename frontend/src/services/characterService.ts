import api from "./apiService";

export class CharacterService {
  async getAllCharactersNames() {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await api.get("/characters");
        return response.data;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          throw error;
        }
      }
    }
  }

  async getAllCharactersFull() {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await api.get("/characters/full");
        return response.data;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          throw error;
        }
      }
    }
  }

  async getRandomId(rarities?: number[]): Promise<{ id: number }> {
    let targetRarities = rarities;

    if (!targetRarities) {
      try {
        const saved = localStorage.getItem("filter");
        targetRarities = saved ? JSON.parse(saved) : [2, 3, 4, 5, 6];
      } catch {
        targetRarities = [2, 3, 4, 5, 6];
      }
    }
    const response = await api.get<{ id: number }>("/characters/random-id", {
      params: {
        rarities:
          targetRarities && targetRarities.length > 0
            ? targetRarities.join(",")
            : undefined,
      },
    });
    return response.data;
  }

  async dailyGuess(slug: string) {
    const response = await api.post("/guess", { slug });
    return response.data;
  }

  async idGuess(id: number, slug: string) {
    const response = await api.post(`/guess/${id}`, { slug });
    return response.data;
  }

  async getDailyResult() {
    const response = await api.get("/guess/daily-result");
    return response.data;
  }

  async getYesterdayResult() {
    const response = await api.get("/guess/yesterday-result");
    return response.data;
  }
}
