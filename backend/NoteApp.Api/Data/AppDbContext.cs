using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Entities;
using NoteApp.Api.Helpers;

namespace NoteApp.Api.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //note constraints
            modelBuilder.Entity<Note>()
                .Property(n => n.Id)
                .HasDefaultValueSql("NEWSEQUENTIALID()");

            modelBuilder.Entity<Note>()
                .Property(n => n.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Note>()
                .Property(n => n.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Note>()
                .Property(n => n.Title)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<Note>()
                .Property(n => n.Slug)
                .HasMaxLength(70)
                .IsRequired();

            modelBuilder.Entity<Note>()
                .HasIndex(n => n.Slug)
                .IsUnique();
                

            //folder constraints
            modelBuilder.Entity<Folder>()
                .Property(f => f.Id)
                .HasDefaultValueSql("NEWSEQUENTIALID()");

            modelBuilder.Entity<Folder>()
                .Property(f => f.FolderName)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<Folder>()
                .Property(f => f.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Folder>()
                .HasOne(e => e.ParentFolder)
                .WithMany(e => e.Folders)
                .HasForeignKey(e => e.ParentId)
                .IsRequired(false);

            //users constraints
            modelBuilder.Entity<ApplicationUser>()
                .Property(x => x.FullName)
                .HasMaxLength(50);

            //attachment constrains
            modelBuilder.Entity<Note>()
                .HasMany(n => n.Attachments)
                .WithOne(a => a.Note)
                .HasForeignKey(a => a.NoteId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Attachment>()
                .Property(a => a.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Attachment>()
                .Property(a => a.MimeType)
                .HasMaxLength(50);

            modelBuilder.Entity<Attachment>()
                .Property(a => a.OriginalName)
                .HasMaxLength(256);

            modelBuilder.Entity<Attachment>()
                .Property(a => a.Id)
                .HasDefaultValueSql("NEWSEQUENTIALID()");

            //refresh token constrains
            modelBuilder.Entity<RefreshToken>()
                .ToTable("RefreshToken");

            modelBuilder.Entity<RefreshToken>()
                .Property(r => r.UserId)
                .HasMaxLength(450);

            modelBuilder.Entity<RefreshToken>()
                .HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId);

            //tags constraints
            modelBuilder.Entity<Tag>()
                .Property(t => t.Name)
                .HasMaxLength(100);

            modelBuilder.Entity<Tag>()
                .HasMany(t => t.Notes)
                .WithMany(n => n.Tags)
                .UsingEntity<NotesToTags>(
                    r => r.HasOne(e => e.Note).WithMany().OnDelete(DeleteBehavior.Cascade),
                    l => l.HasOne(e => e.Tag).WithMany().OnDelete(DeleteBehavior.NoAction));

            modelBuilder.Entity<Tag>()
                .HasIndex(t => new {t.UserId, t.Name})
                .IsUnique();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var parser = new TipTapParser();

            var entries = ChangeTracker.Entries<Note>()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach(var entry in entries)
            {
                entry.Entity.SearchableBody = parser.ExtractPlainText(entry.Entity.Body ?? "");
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }

            return base.SaveChangesAsync(cancellationToken);
        }
        public DbSet<Note> Notes { get; set; }
        public DbSet<Folder> Folders { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Tag> Tags { get; set; }
    }
}
