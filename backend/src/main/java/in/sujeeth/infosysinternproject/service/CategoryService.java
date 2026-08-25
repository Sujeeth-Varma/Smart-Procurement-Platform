package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.CategoryDto;
import in.sujeeth.infosysinternproject.entity.Category;
import in.sujeeth.infosysinternproject.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToCategoryDto)
                .collect(Collectors.toList());
    }

    public CategoryDto mapToCategoryDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .build();
    }
}
