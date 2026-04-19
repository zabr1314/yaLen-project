import Phaser from 'phaser';

export default class SpeechBubble extends Phaser.GameObjects.Container {
  private bubble: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private timer?: Phaser.Time.TimerEvent;
  private typingTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.bubble = scene.add.graphics();
    // 去掉 wordWrap，单行显示短文本
    this.text = scene.add.text(0, 0, '', {
      fontFamily: 'ArkPixel, monospace',
      fontSize: '12px',
      color: '#000000',
      align: 'center'
    });
    this.text.setResolution(2);

    this.add(this.bubble);
    this.add(this.text);

    this.setVisible(false);
    this.setDepth(100);

    scene.add.existing(this);
  }

  /** 纯文本摘要：去 Markdown + 去换行 + 限 20 字，保证单行显示 */
  private truncate(message: string): string {
    const plain = message
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s*/g, '')
      .replace(/[-*+]\s+/g, '')
      .replace(/\r?\n|\r/g, ' ')
      .replace(/\t+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return plain.length > 20 ? plain.slice(0, 20) + '...' : plain;
  }

  stream(message: string) {
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.active) return;

    if (this.typingTimer) {
      this.typingTimer.remove();
      this.typingTimer = undefined;
    }
    this.scene.tweens.killTweensOf(this);
    this.setAlpha(1);
    this.setVisible(true);

    const display = this.truncate(message);
    this.renderBubble(display);
  }

  show(message: string, duration: number = 2000) {
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.active) return;

    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
    if (this.typingTimer) {
      this.typingTimer.remove();
      this.typingTimer = undefined;
    }

    this.scene.tweens.killTweensOf(this);
    this.setAlpha(1);
    this.setVisible(true);

    const display = this.truncate(message);
    this.text.setText('');
    this.text.setVisible(true);
    this.renderBubble(display);

    // 打字机效果（最多 23 个字符，很快打完）
    let currentChar = 0;
    this.typingTimer = this.scene.time.addEvent({
      delay: 50,
      repeat: display.length,
      callback: () => {
        if (this.text && this.text.active) {
          this.text.setText(display.substring(0, currentChar));
          currentChar++;
        }
      }
    });

    const totalDuration = duration + display.length * 50;
    this.timer = this.scene.time.delayedCall(totalDuration, () => {
      if (this.scene) {
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.setVisible(false);
            this.text.setText('');
          }
        });
      }
    });
  }

  private renderBubble(display: string) {
    const padding = 8;

    // 用临时文本计算单行尺寸
    const tempText = this.scene.add.text(0, 0, display, {
      fontFamily: 'ArkPixel, monospace',
      fontSize: '12px',
      color: '#000000',
      align: 'center'
    });
    const width = tempText.width + padding * 2;
    const height = tempText.height + padding * 2;
    tempText.destroy();

    this.bubble.clear();
    this.bubble.fillStyle(0xffffff, 1);
    this.bubble.lineStyle(2, 0x000000, 1);
    this.bubble.fillRect(-width / 2, -height - 10, width, height);
    this.bubble.strokeRect(-width / 2, -height - 10, width, height);
    this.bubble.fillTriangle(0, -10, -6, -10, 0, 0);
    this.bubble.strokeTriangle(0, -10, -6, -10, 0, 0);
    this.bubble.fillStyle(0xffffff, 1);
    this.bubble.fillTriangle(-1, -10, -5, -10, 0, -2);

    this.text.setPosition(-width / 2 + padding, -height - 10 + padding);
    this.text.setText(display);
  }
}
