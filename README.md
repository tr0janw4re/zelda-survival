# The Legend of Zelda: Survival
this name can change later, but in a shorter way:
Zelda Survival is a survival game, using the The Legend of Zelda: Link's Awakening sprites (because they are amazing)

# Procedural Generation!
I LOVE PRODURAL GENERATION! its f*cking AMAZING!

#include<iostream>
#include "FastNoiseLite.h"
#include<vector>
#include<windows.h>
#include<cstdlib>
#include<ctime>

int main() {
	
	FastNoiseLite noise;
	noise.SetNoiseType(FastNoiseLite::NoiseType_Perlin);
	
	srand(time(NULL));
	
	double noiseValue = noise.GetNoise(static_cast<double>(rand()) / RAND_MAX;);
	
	std::vector<int> numbers;
	
	numbers.push_back(10);
	numbers.push_back(20);
	numbers.push_back(30);
	
	for (int num : numbers) {
		std::cout << "Numbers: " << num << '\n';
	}
	
	system("pause");
	
	return 0;
	
}
