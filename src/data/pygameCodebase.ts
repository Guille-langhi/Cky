import { PygameFile } from "../types";

export const pygameCodebase: PygameFile[] = [
  {
    name: "main.py",
    path: "main.py",
    description: "The primary entry point of the Pygame application. Initializes pygame, sets up the window, and runs the main state machine game loop.",
    content: `import pygame
import sys
from config import Config
from constants import SCREEN_WIDTH, SCREEN_HEIGHT, TITLE, FPS
from states.title_state import TitleState

class GameApp:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption(TITLE)
        
        # Setup resolution (640x480 native, scaled x2 in Config if required)
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        self.clock = pygame.time.Clock()
        self.running = True
        
        # State Machine Initialization
        self.state_stack = []
        
        # Push initial Title Screen state
        title_state = TitleState(self)
        self.state_stack.append(title_state)

    def run(self):
        while self.running:
            dt = self.clock.tick(FPS) / 1000.0  # Delta time in seconds
            self.handle_events()
            self.update(dt)
            self.render()

    def handle_events(self):
        events = pygame.event.get()
        for event in events:
            if event.type == pygame.QUIT:
                self.running = False
                
        if self.state_stack:
            self.state_stack[-1].handle_events(events)

    def update(self, dt):
        if self.state_stack:
            self.state_stack[-1].update(dt)
        else:
            self.running = False

    def render(self):
        # Clear screen (silent, dark, elegant)
        self.screen.fill((15, 23, 42))
        
        if self.state_stack:
            self.state_stack[-1].render(self.screen)
            
        pygame.display.flip()

    def quit(self):
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    app = GameApp()
    app.run()
    app.quit()
`
  },
  {
    name: "config.py",
    path: "config.py",
    description: "Global game configurations such as video settings, audio options, and language definitions.",
    content: `# Global configuration options for CKY
class Config:
    def __init__(self):
        self.fullscreen = False
        self.volume = 80
        self.language = "es"  # "es" for Spanish, "en" for English
        self.scale_factor = 2 # 1280x960 output if scaling
        self.show_debug = False

# Singleton Config instance
game_config = Config()
`
  },
  {
    name: "constants.py",
    path: "constants.py",
    description: "Definition of constants such as resolution, FPS, color palettes, and tile sizing.",
    content: `# Screen constants
SCREEN_WIDTH = 640
SCREEN_HEIGHT = 480
FPS = 60
TITLE = "CKY - 8-Bit RPG"

# Grid sizing
TILE_SIZE = 32

# 8-bit aesthetic Colors (Hex to RGB)
COLOR_DARK_SLATE = (15, 23, 42)
COLOR_WHITE = (255, 255, 255)
COLOR_YELLOW = (234, 179, 8)     # CKY Title Yellow
COLOR_CYAN = (6, 182, 212)       # Spirit theme
COLOR_PINK = (236, 72, 153)       # Highlight
COLOR_CHARCOAL = (30, 41, 59)
COLOR_LIMBO = (8, 47, 73)         # Limbo dark blue
`
  },
  {
    name: "state.py",
    path: "states/state.py",
    description: "The abstract base state class that defines the core interface for the state machine (Title, Dialog, Combat, etc.).",
    content: `class State:
    def __init__(self, game):
        self.game = game
        self.prev_state = None

    def handle_events(self, events):
        pass

    def update(self, dt):
        pass

    def render(self, screen):
        pass

    def enter_state(self):
        if len(self.game.state_stack) > 1:
            self.prev_state = self.game.state_stack[-1]
        self.game.state_stack.append(self)

    def exit_state(self):
        self.game.state_stack.pop()
`
  },
  {
    name: "title_state.py",
    path: "states/title_state.py",
    description: "The CKY Title Screen state. Implements the specific yellow title on black background and navigation between options.",
    content: `import pygame
from states.state import State
from constants import SCREEN_WIDTH, SCREEN_HEIGHT, COLOR_YELLOW, COLOR_WHITE, COLOR_DARK_SLATE

class TitleState(State):
    def __init__(self, game):
        super().__init__(game)
        self.options = ["NUEVO JUEGO", "CONTINUAR"]
        self.options_en = ["NEW GAME", "CONTINUE"]
        self.selected_index = 0
        self.font_title = pygame.font.SysFont("Courier", 72, bold=True)
        self.font_menu = pygame.font.SysFont("Courier", 24)
        self.font_sub = pygame.font.SysFont("Courier", 14)

    def handle_events(self, events):
        for event in events:
            if event.type == pygame.KEYDOWN:
                if event.key in [pygame.K_DOWN, pygame.K_s]:
                    self.selected_index = (self.selected_index + 1) % len(self.options)
                elif event.key in [pygame.K_UP, pygame.K_w]:
                    self.selected_index = (self.selected_index - 1) % len(self.options)
                elif event.key in [pygame.K_RETURN, pygame.K_SPACE]:
                    self.select_option()

    def select_option(self):
        if self.selected_index == 0:
            # Start New Game
            # transition to GameState (explore house)
            print("Iniciando nuevo juego de CKY...")
            # For boilerplate, we output selection
        elif self.selected_index == 1:
            # Continue from save state
            print("Cargando partida...")

    def update(self, dt):
        pass

    def render(self, screen):
        # Draw background
        screen.fill((10, 10, 12))
        
        # Render "CKY" title in yellow
        title_surf = self.font_title.render("CKY", True, COLOR_YELLOW)
        title_rect = title_surf.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 3))
        screen.blit(title_surf, title_rect)
        
        # Render options
        lang = "es" # fallback
        opts = self.options if lang == "es" else self.options_en
        for idx, option in enumerate(opts):
            color = COLOR_YELLOW if idx == self.selected_index else COLOR_WHITE
            text = f"> {option}" if idx == self.selected_index else option
            opt_surf = self.font_menu.render(text, True, color)
            opt_rect = opt_surf.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + (idx * 40)))
            screen.blit(opt_surf, opt_rect)
            
        # Credits/Footnote
        foot_surf = self.font_sub.render("CKY RPG © 2026 - Heredera del Maximo Poder", True, (100, 100, 100))
        foot_rect = foot_surf.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 30))
        screen.blit(foot_surf, foot_rect)
`
  },
  {
    name: "player.py",
    path: "entities/player.py",
    description: "Definition of the CKY Player class. Manages top-down 4-direction coordinate movement, static facing, and collision checks.",
    content: `import pygame
from constants import TILE_SIZE, COLOR_YELLOW

class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        # Simple 8-bit character block representer
        self.image = pygame.Surface((24, 32))
        self.image.fill(COLOR_YELLOW)
        
        # Draw eyes on the block to see where she's facing
        pygame.draw.rect(self.image, (0, 0, 0), (4, 6, 4, 4))
        pygame.draw.rect(self.image, (0, 0, 0), (16, 6, 4, 4))
        
        self.rect = self.image.get_rect()
        self.rect.x = x * TILE_SIZE
        self.rect.y = y * TILE_SIZE
        
        self.speed = 150.0  # pixels per second
        self.facing = "down"

    def update(self, dt, obstacles):
        keys = pygame.key.get_pressed()
        dx, dy = 0, 0
        
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            dx = -1
            self.facing = "left"
        elif keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            dx = 1
            self.facing = "right"
        elif keys[pygame.K_UP] or keys[pygame.K_w]:
            dy = -1
            self.facing = "up"
        elif keys[pygame.K_DOWN] or keys[pygame.K_s]:
            dy = 1
            self.facing = "down"
            
        # Normalize motion
        if dx != 0 or dy != 0:
            length = (dx*dx + dy*dy)**0.5
            dx = (dx / length) * self.speed * dt
            dy = (dy / length) * self.speed * dt
            
            # Apply movement with collision check
            self.move_with_collisions(dx, dy, obstacles)

    def move_with_collisions(self, dx, dy, obstacles):
        # X-axis move & check
        self.rect.x += dx
        for wall in obstacles:
            if self.rect.colliderect(wall):
                if dx > 0:
                    self.rect.right = wall.left
                if dx < 0:
                    self.rect.left = wall.right
                    
        # Y-axis move & check
        self.rect.y += dy
        for wall in obstacles:
            if self.rect.colliderect(wall):
                if dy > 0:
                    self.rect.bottom = wall.top
                if dy < 0:
                    self.rect.top = wall.bottom
`
  },
  {
    name: "tilemap.py",
    path: "world/tilemap.py",
    description: "Generates grid tile maps representing CKY's room, house, and city streets for 2D collidable render.",
    content: `import pygame
from constants import TILE_SIZE, COLOR_CHARCOAL

class TileMap:
    def __init__(self):
        # 1 = Wall, 0 = Empty floor
        self.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ]
        self.obstacles = []
        self.generate_obstacles()

    def generate_obstacles(self):
        self.obstacles = []
        for r_idx, row in enumerate(self.grid):
            for c_idx, cell in enumerate(row):
                if cell == 1:
                    rect = pygame.Rect(c_idx * TILE_SIZE, r_idx * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                    self.obstacles.append(rect)

    def draw(self, screen):
        for r_idx, row in enumerate(self.grid):
            for c_idx, cell in enumerate(row):
                rect = pygame.Rect(c_idx * TILE_SIZE, r_idx * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                if cell == 1:
                    pygame.draw.rect(screen, COLOR_CHARCOAL, rect)
                    pygame.draw.rect(screen, (50, 50, 70), rect, 1) # Outline
                else:
                    pygame.draw.rect(screen, (20, 30, 45), rect)
`
  }
];
